import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import {
  Injectable,
  HttpException,
  HttpStatus,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
// import { JwtPayload } from './interfaces/payload.interface';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'SECRETKEY',
    });
  }

  async validate(payload): Promise<CreateAuthDto> {
    const user = await this.authService.validateUser(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}

export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
