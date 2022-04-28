import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// const API_KEY = process.env.API_KEY
@Injectable()
export class OnesignalService {

   constructor(
      //  private API_KEY = process.env.API_KEY,
      //  private APP_ID = process.env.APP_ID
      private configService : ConfigService
   ){}
      

  async check(){
    console.log(this.configService.get("APP_ID"))
  }

   async send(data){
    var headers = {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${this.configService.get("API_KEY")}`
      };
      
      var options = {
        host: "onesignal.com",
        port: 443,
        path: "/api/v1/notifications",
        method: "POST",
        headers: headers
      };
      
      var https = require('https');
      var req = https.request(options, function(res) {  
        res.on('data', function(data) {
          console.log("Response:");
          console.log(JSON.parse(data));
        });
      });
      
      req.on('error', function(e) {
        console.log("ERROR:");
        console.log(e);
      });
      
      req.write(JSON.stringify(data));
      req.end();
    }


    async sendNotificationToAllUsers(messageContent){

        var message = { 
            app_id: this.configService.get("APP_ID"),
            contents: {"en": messageContent},
            included_segments: ["Subscribed Users"]
        };

        this.send(message)        
    }

    async sendNotificationToSpecificPlayerIds(messageContent,playerIdsArray){
        var message = { 
            app_id: this.configService.get("APP_ID"),
            contents: {"en": messageContent},
            include_player_ids: playerIdsArray
          };
        this.send(message) 
    }



    
}
