import {
    IsNotEmpty,
    IsEmail,
    IsOptional,
    Min,
    Max,
    IsEnum,
    IsNumber,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsLowercase,
  } from 'class-validator';
  import { ApiProperty, ApiBody } from '@nestjs/swagger';
  import { RegisterRole } from '../../schemas/enums/role';
  import { CountryCodes } from '../../shared/countries';
  
  export class CreateAuthDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    // @IsLowercase()
    email: string;
  
    // @ApiProperty()
    // @IsOptional()
    // phone: number;
  
    // @ApiProperty()
    // @IsOptional()
    // state: string = 'ALL';
  
    // @ApiProperty({ enum: CountryCodes })
    // @IsNotEmpty()
    // country: string;
  
    @ApiProperty({ enum: ['USER'], description: 'Optional' })
    @IsOptional()
    userType: RegisterRole;
  
    otp: number;
  }
  
  export class LoginDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty()
    @IsNotEmpty()
    password: string;
  }
  
  export class AccountVerify {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    otp: number;
  }
  
  export class ForgotPassword {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    otp: number;
  }
  
  export class PasswordReset {
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
    password: string;
  
    @ApiProperty({ type: Number })
    @IsNotEmpty()
    @IsNumber()
    otp: number;
  }
  
  export enum SocialTypes {
    Facebook = 'facebook',
    Google = 'google',
    apple = 'apple',
  }

  export class changePassword{
    @ApiProperty()
    @IsNotEmpty()
    "newPassword": string;

    @ApiProperty()
    @IsNotEmpty()
    "oldPassword": string;
  }
  
  export class SocialRegister {
    @ApiProperty({ enum: ['facebook', 'google', 'apple'] })
    @IsNotEmpty()
    type: SocialTypes;
  
    @ApiProperty()
    @IsNotEmpty()
    socialId: string;
  
    @ApiProperty()
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsString()
    name: string;
  
  //   @ApiProperty({ enum: CountryCodes })
  //   @IsNotEmpty()
  //   @IsString()
  //   country: string;
  }
  