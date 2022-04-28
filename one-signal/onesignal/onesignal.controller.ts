import { Controller, Post } from '@nestjs/common';
import { OnesignalService } from './onesignal.service';

@Controller('onesignal')
export class OnesignalController {

    constructor(
        private readonly oneSignalService : OnesignalService,
        // private readonly oneSignalService : OnesignalService        
    ){}
    @Post("check")
    async check(){
        return this.oneSignalService.sendNotificationToAllUsers("check")
    }

}
