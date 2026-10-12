import { Controller, Post, Get, Body, UseGuards, Request, Response, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from './jwt.strategy';

/** Resolved user object attached by JwtAuthGuard */
interface AuthenticatedRequest {
    user: { id: number; username: string; role: string; displayName: string; isActive: boolean };
}

const COOKIE_NAME = 'access_token';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login — sets httpOnly access_token cookie and returns user profile' })
    async login(
        @Body() dto: LoginDto,
        @Response({ passthrough: true }) res: ExpressResponse,
    ) {
        const { accessToken, user } = await this.authService.login(dto);

        const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
        res.cookie(COOKIE_NAME, accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            // 8 hours in milliseconds
            maxAge: 8 * 60 * 60 * 1000,
            path: '/',
        });

        // Return user profile only — never expose the raw token to JS
        return { user };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout — clears the access_token cookie' })
    async logout(@Response({ passthrough: true }) res: ExpressResponse) {
        res.clearCookie(COOKIE_NAME, { path: '/' });
        return { message: 'Logged out successfully' };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiCookieAuth()
    @ApiOperation({ summary: 'Get current user profile (requires auth cookie or Bearer token)' })
    async getProfile(@Request() req: AuthenticatedRequest) {
        return this.authService.getProfile(req.user.id);
    }
}
