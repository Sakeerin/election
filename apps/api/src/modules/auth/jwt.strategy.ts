import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../common/prisma/prisma.service';

export interface JwtPayload {
    sub: number;
    username: string;
    role: string;
}

/** Extract JWT from httpOnly cookie or fallback to Authorization Bearer header */
function cookieOrBearerExtractor(req: Request): string | null {
    if (req?.cookies?.access_token) {
        return req.cookies.access_token as string;
    }
    return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
            throw new InternalServerErrorException(
                'JWT_SECRET environment variable is not set. Refusing to start with an insecure default.',
            );
        }
        super({
            jwtFromRequest: cookieOrBearerExtractor,
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
            passReqToCallback: false,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, username: true, role: true, isActive: true, displayName: true },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }
}
