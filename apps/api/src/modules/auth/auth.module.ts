import { Module } from '@nestjs/common';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../../common/prisma/prisma.module';

/** jsonwebtoken types `expiresIn` as a number or an `ms`-style string such as "8h". */
type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

@Module({
    imports: [
        ConfigModule,
        PrismaModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const jwtSecret = configService.get<string>('JWT_SECRET');
                if (!jwtSecret) {
                    throw new Error('JWT_SECRET environment variable is not set.');
                }
                return {
                    secret: jwtSecret,
                    signOptions: {
                        expiresIn: configService.get<string>('JWT_EXPIRATION', '8h') as JwtExpiresIn,
                    },
                };
            },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
