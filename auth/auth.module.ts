import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.shema';
import { HelperModule } from '../helper/helper.module';
import { HelperService } from 'src/helper/helper.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),

    HelperModule,
    UsersModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: 'SECRETKEY',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, HelperService, JwtStrategy],
  exports: [PassportModule, JwtModule],
})
export class AuthModule {}
