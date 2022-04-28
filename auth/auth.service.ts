import { Injectable, HttpException, HttpStatus, Req } from '@nestjs/common';
import {
  CreateAuthDto,
  AccountVerify,
  LoginDto,
  ForgotPassword,
  PasswordReset,
} from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../schemas/user.shema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import otpTemplate from '../template/mail/signup-otp';
import passwordOtpTemplate from '../template/mail/otp-mail';
import emailVerifyTemplate from '../template/mail/email-verify';
import mailer from '../config/mail';
import CONFIG from '../config/configuration';
import { Response, ResponseObj } from '../shared/response';
import { encrypt, decrypt } from '../shared/utils';
import * as CryptoJS from 'crypto-js';
import { LoginUserMapper } from '../shared/mapper';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    public configService: ConfigService,

  ) {}

  async register(userDto, @Req() req): Promise<Response> {
    try {
      const userInDb = await this.usersService.findOne({
        email: userDto.email,
      });

      if (userInDb) {
        throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
      }

      let otp = Math.floor(1000 + Math.random() * 9000);
      userDto.otp = otp;

      if (!userDto.state) {
        userDto.state = 'ALL';
      }

      // var obj = {email : userDto.email.toLowerCase(), name : userDto.name, password : userDto.password }

      let user = await this.usersService.create(userDto);
      console.log(user)

      await this.sendSignupOtp(user, otp);
      // await this.sendVerificationEmail(user, otp, req);
      ResponseObj.success = true;
      ResponseObj.message =
        'User registered successfully, an email has been sent with verification code';
      ResponseObj.data = {};
      return ResponseObj;
    } catch (err) {
      ResponseObj.message = err.message;
      ResponseObj.success = false;
      ResponseObj.data = err;
      return ResponseObj;
    }
  }

  async socialRegister(socialRegister) {
    try {
      let userSocialRegister = await this.usersService.socialRegister(
        socialRegister,
      );
      let token = this._createToken(userSocialRegister);
      ResponseObj.success = true;
      ResponseObj.message = 'User registered is successfully';
      ResponseObj.data = LoginUserMapper(userSocialRegister, token);
      return ResponseObj;
    } catch (err) {
      ResponseObj.message = err.message;
      ResponseObj.data = err;
      ResponseObj.success = false;
      return ResponseObj;
    }
  }

  async accountVerification(accountDto: AccountVerify): Promise<Response> {
    var status = {
      success: true,
      message: 'Account verification is successfull',
      data: {},
    };

    try {
      await this.usersService.accountVerify(accountDto);
      var user = await this.userModel.findOne({email: accountDto.email})
      const token = this._createToken(user);
      user = await this.userModel.findOneAndUpdate({email : accountDto.email},{token : token.accessToken},{new:true})
      status = {
        success: true,
        message: 'Account verification is successfull',
        data: LoginUserMapper(user, token),
      };
    } catch (err) {
      status = {
        success: false,
        message: err.message,
        data: err,
      };
    }

    return status;
  }

  async login(loginUserDto: LoginDto): Promise<Response> {
    try {
      var user = await this.usersService.findByLogin(loginUserDto);
      const token = this._createToken(user);
      user = await this.userModel.findOneAndUpdate({email : loginUserDto.email},{token : token.accessToken},{"fields": { "password":0},new:true})
      ResponseObj.success = true;
      ResponseObj.message = 'Login Successfull';
      ResponseObj.data = LoginUserMapper(user, token);
      // ResponseObj.data = user;
      return ResponseObj;
    } catch (err) {
      ResponseObj.message = err.message;
      ResponseObj.data = err;
      ResponseObj.success = false;
      return ResponseObj;
    }
  }


  async changePassword(user, newPassword, oldPassword){

    try{
      const userr = await this.userModel.findOne({_id : user._id})
      const hashedPassword = userr.password
      const validPassword = await bcrypt.compare(oldPassword, hashedPassword);
  
      if(!validPassword){
        ResponseObj.message = "Please Enter the correct password"
        ResponseObj.data = [];
        ResponseObj.success = false;
        return ResponseObj;
      }
      const password = await bcrypt.hash(newPassword, 10);
  
      const userUpdate = await this.userModel.findOneAndUpdate(
        { email: userr.email },
        { password: password},
        { new: true },
      );
      ResponseObj.message = "password changed successfully"
      ResponseObj.data = userUpdate;
      ResponseObj.success = true;

      return ResponseObj;
      
    }catch(err){
      ResponseObj.success = false;
      ResponseObj.message = err.message;
      ResponseObj.data = err;
      return ResponseObj;
  }

  }


  async create(createAuthDto: CreateAuthDto): Promise<any> {
    if (await this.userModel.findOne({ email: createAuthDto.email })) {
      return { msg: 'User already exists', err: 'User already exists' };
    }

    const createUser = new this.userModel(createAuthDto);
    return await createUser.save();
  }

  async userExists({ email }) {
    try {
      const user = await this.usersService.findOne({ email });
      if (!user) {
        return {
          success: true,
          message: "User doesn't exist",
          data: { isUserExists: false },
        };
      }
      return {
        success: true,
        message: 'User Exists',
        data: { isUserExists: true },
      };
    } catch (err) {
      return { success: false, message: err.message, data: err };
    }
  }


 
  async  userUpdate(data: any, id){

  const userUpdated = await this.userModel.findOneAndUpdate({_id : id}, data, {new : true});
    
  ResponseObj.success = true;
  ResponseObj.message ='User updated successfully';
  ResponseObj.data = userUpdated;
  
  return ResponseObj;
  
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPassword,
    isRegister,
  ): Promise<Response> {
    try {
      let otp = Math.floor(1000 + Math.random() * 9000);
      forgotPasswordDto.otp = otp;
      const user = await this.usersService.forgotPassword(forgotPasswordDto);
      if (isRegister) {
        await this.sendSignupOtp(user, otp);
      } else {
        await this.sendPasswordOtp(user, otp);
      }
      ResponseObj.success = true;
      ResponseObj.message = `An email has been sent to ${forgotPasswordDto.email} with verification pin`;
      ResponseObj.data = {};
      return ResponseObj;
    } catch (err) {
      ResponseObj.message = err.message;
      ResponseObj.data = err;
      ResponseObj.success = false;
      return ResponseObj;
    }
  }

  async resetPassword(payload: PasswordReset): Promise<Response> {
    try {
      await this.usersService.resetPassword(payload);
      ResponseObj.success = true;
      ResponseObj.message = `Password reset successfully`;
      ResponseObj.data = {};
      return ResponseObj;
    } catch (err) {
      ResponseObj.message = err.message;
      ResponseObj.data = err;
      ResponseObj.success = false;
      return ResponseObj;
    }
  }

  async validateUser(payload): Promise<CreateAuthDto> {
    const user = await this.usersService.findByPayload(payload);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private _createToken(data): any {
    const expiresIn = process.env.EXPIRESIN;

    const user = { userId: data._id, email: data.email };
    const accessToken = this.jwtService.sign(user);
    return {
      expiresIn,
      accessToken,
    };
  }

  private sendSignupOtp(user, otp) {
    const config = this.configService.get('EMAIL_SMTP');
    console.log('config : ', config);
    const mailData = {
      from: config.MAIL_FROM_ADDRESS,
      to: user.email,
      subject: `${user.name}, here's your PIN | ${config.APP_NAME}`,
      html: otpTemplate(global.app_url, { name: user.name, otp }, config),
    };

    mailer(mailData, config, (response) => {
      if (response.success) {
        return {
          msg: 'Account verification mail sent successfully',
          success: true,
        };
      } else {
        return new Error('Unable to send verification email');
      }
    });
  }

  private async sendVerificationEmail(user, otp, req) {
    const config = this.configService.get('EMAIL_SMTP');
    const ciphertext = encrypt('' + otp);
    const mailData = {
      from: config.MAIL_FROM_ADDRESS,
      to: user.email,
      subject: `${user.name}, here's your verification link | ${config.APP_NAME}`,
      html: emailVerifyTemplate(
        req.appUrl,
        {
          name: user.name,
          email: user.email,
          otp: ciphertext,
        },
        config,
      ),
    };

    mailer(mailData, config, (response) => {
      if (response.success) {
        return {
          msg: 'Account verification mail sent successfully',
          success: true,
        };
      } else {
        return new Error('Unable to send verification email');
      }
    });
  }

  private sendPasswordOtp(user, otp) {
    const config = this.configService.get('EMAIL_SMTP');
    const mailData = {
      from: config.MAIL_FROM_ADDRESS,
      to: user.email,
      subject: `${user.name}, here's your PIN | ${config.APP_NAME}`,
      html: passwordOtpTemplate(
        global.app_url,
        { name: user.name, otp },
        config,
      ),
    };

    mailer(mailData, config, (response) => {
      if (response.success) {
        return { msg: 'OTP mail sent successfully', success: true };
      } else {
        return new Error('Unable to send otp email');
      }
    });
  }
}
