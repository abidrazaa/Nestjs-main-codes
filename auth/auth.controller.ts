import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Req,
    Res,
    HttpException,
    HttpStatus,
    UseGuards,
    Query,
    Render,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import {
    CreateAuthDto,
    AccountVerify,
    LoginDto,
    ForgotPassword,
    PasswordReset,
    SocialRegister,
    changePassword,
  } from './dto/create-auth.dto';
  import { UpdateAuthDto } from './dto/update-auth.dto';
  import { AuthGuard } from '@nestjs/passport';
  import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
  import otpTemplate from '../template/mail/signup-otp';
  import mailer from '../config/mail';
  import CONFIG from '../config/configuration';
  import { Response, ApiResponses } from '../shared/response';
  import { decrypt } from '../shared/utils';
  import * as CryptoJS from 'crypto-js';
  import {
    CountriesList,
    CountryCodes,
    CountryNames,
    USStateFlagsList,
  } from '../shared/countries';
  import { ApiOperation, ApiQuery } from '@nestjs/swagger';
  import { UserMapper } from '../shared/mapper';
  import { AllowAny } from '../config/auth-guard';
import { UserEvent } from 'src/schemas/user-events.schema';
import { UpdateUserDto } from 'src/users/dto/user-update.dto';
import { CurrentUser } from './jwt.strategy';
  
  @Controller()
  @ApiTags('Auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Get('thank-you')
    @ApiResponses(false)
    @Render('index.hbs')
    root() {
      return { message: 'Hello world!' };
    }

    
    @Post('register')
    @ApiResponses(false)
    public async register(
      @Body() createUserDto: CreateAuthDto,
      @Req() req,
    ): Promise<Response> {
      // createUserDto.country = createUserDto.country.toLowerCase();
      // if (!CountryCodes.includes(createUserDto.country)) {
      //   throw new HttpException(
      //     'Invalid Country Code. required string of 2-letter ISO 3166-1 countries',
      //     HttpStatus.BAD_REQUEST,
      //   );
      // }
      const result = await this.authService.register(createUserDto, req);
  
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }
  
    // @Post('social-auth')
    // @ApiResponses(false)
    // public async socialRegister(
    //   @Body() socialRegisterDto: SocialRegister,
    // ): Promise<any> {
    //   // socialRegisterDto.country = socialRegisterDto.country.toLowerCase();
    //   const result = await this.authService.socialRegister(socialRegisterDto);
  
    //   if (!result.success) {
    //     throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    //   }
  
    //   return result;
    // }
  
    @Post('account-verify')
    @ApiResponses(false)
    async accountVerification(
      @Body() accountVerify: AccountVerify,
    ): Promise<Response> {
      const result = await this.authService.accountVerification(accountVerify);
  
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }
  
    // @Get('verify-account')
    // async verifyAccount(@Query() query, @Res() res): Promise<any> {
    //   const { token, email, auth } = query;
  
    //   if (!email) {
    //     return { msg: 'Invalid email addrees', err: 'Invalid email addrees' };
    //   }
  
    //   if (!token) {
    //     return { msg: 'Invalid user token', err: 'Invalid user token' };
    //   }
  
    //   if (!auth) {
    //     return { msg: 'Invalid auth value', err: 'Invalid user token' };
    //   }
    //   var originalText = decrypt({ iv: token, content: auth });
  
    //   const result = await this.authService.accountVerification({
    //     email,
    //     otp: parseInt(originalText),
    //   });
  
    //   if (!result.success) {
    //     throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
    //   }
  
    //   // return { token, email, originalText, result }
    //   return res.redirect('/thank-you');
    // }
  
    @Post('login')
    @ApiResponses(false)
    public async login(@Body() loginUserDto: LoginDto): Promise<any> {
      return await this.authService.login(loginUserDto);
    }
  
    @Post('forgot-password')
    @ApiResponses(false)
    @ApiQuery({
      name: 'Resend Otp',
      description:
        'Please include a query string .e.g "?register=true" to resend registeration verification email',
      type: String,
      required: false, // This value is optional
    })
    public async forgotPassword(
      @Body() forgotPasswordDto: ForgotPassword,
      @Req() req,
    ): Promise<any> {
      // console.log("check")
      const isRegister = req.query.register == 'true' ? true : false;
      // console.log("check")
      const result = await this.authService.forgotPassword(
        forgotPasswordDto ,isRegister,
      );
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }
  
    @Post('reset-password')
    @ApiResponses(false)
    public async resetPassword(@Body() payload: PasswordReset): Promise<any> {
      const result = await this.authService.resetPassword(payload);
  
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }
  
    @Post('user-exists')
    @ApiResponses(false)
    public async userExists(@Body() data: ForgotPassword): Promise<any> {
      const result = await this.authService.userExists(data);
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }
  
    @Get('me')
    @ApiResponses()
    // @ApiBearerAuth('access-token')
    // @UseGuards(AuthGuard('jwt'))
    public async testAuth(@Req() req: any): Promise<any> {
      return UserMapper(req.user);
    }

    @ApiResponses()
    @Post("change-password")
    private async changePassword(@CurrentUser() user : any, @Body() payload : changePassword){
      const { newPassword, oldPassword } = payload
      console.log(newPassword)
      console.log(user)
      const result = await this.authService.changePassword(user,newPassword, oldPassword)
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }

    @Post('updateUser/:id')
    @ApiResponses(false)
    public async updateUser(
      @Body() UpdateUserDto: UpdateUserDto,
      // @Req() req,
      @Param("id") id : string  
    ): Promise<Response>  {
      const result = await this.authService.userUpdate(UpdateUserDto, id);
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }
  
      return result;
    }

  }
  

 