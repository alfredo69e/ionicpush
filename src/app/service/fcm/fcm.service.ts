import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase/ngx';
import { Platform } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { LocalNotifications } from '@ionic-native/local-notifications/ngx';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private firebase: Firebase,
    private afs: AngularFirestore,
    private platform: Platform,
    private localNotifications: LocalNotifications
    ) { }

    async getToken() {
      let token;

      if (this.platform.is('android')) {
        token = await this.firebase.getToken();
      }

      if (this.platform.is('ios')) {
        token = await this.firebase.getToken();
        await this.firebase.grantPermission();
      }

      console.log('este es mi  token', token);

      this.saveToken(token);
    }

    private saveToken(token) {
      if (!token) {
        return;
      }

      const devicesRef = this.afs.collection('devices');

      const data = {
        token,
        userId: 'testUserId'
      };

      return devicesRef.doc(token).set(data);
    }

    onNotifications() {
      return this.firebase.onNotificationOpen();
    }


    notificationSetup() {

      if (this.platform.is('android')) {
        this.firebase.getToken()
          .then((token: string) => {
            console.log('este es el token para este dispositivo: ', token);
          })
          .catch((err) => {
            console.log(err);
          });
      }

      if (this.platform.is('ios')) {
        this.firebase.grantPermission();
        this.firebase.getToken()
          .then((token: string) => {
            console.log('este es el token para este dispositivo: ', token);
          })
          .catch((err) => {
            console.log(err);
          });
      }


      this.firebase.onTokenRefresh()
      .subscribe((token: string) => {
        console.log('Actualizacion del token para este dispositivo: ', token);
      },
      (err) => {
        console.log(err);
      });

      this.firebase.onNotificationOpen()
      .subscribe((data) => {
        console.log(data);

        if (data.tap) {
          console.log('esto ocurre cuando la aplicacion se encuantra en segundo plano ', data);

        } else {
          console.log('esto ocurre cuando la aplicacion se encuantra en primer plano ', data);
          this.localNotifications.schedule({
            id: 1,
            title: data.title,
            text: data.body,
            sound: this.platform.is('android') ? 'file://sound.mp3' : 'file://beep.caf',
            data: { secret: '234945Zxcew1234' },
            smallIcon: 'https://img.icons8.com/color/48/000000/mongrol.png',
            icon: 'https://img.icons8.com/color/48/000000/blackblood.png'
          });
        }
      },
      (err) => {
        console.log(err);
      });

    }

}
