import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Accident } from "../../models/accident";
import { UUID } from "angular2-uuid";
import { FirebaseListObservable, AngularFireDatabase } from "angularfire2/database";
import { Subscription } from "rxjs/Subscription";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { ImageProvider } from "../../providers/image/image";
import { AngularFireAuth } from "angularfire2/auth";
import { Geolocation } from '@ionic-native/geolocation';

/**
 * Generated class for the AddaccidentPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@Component({
  selector: 'page-addaccident',
  templateUrl: 'addaccident.html',
})
export class AddaccidentPage {

  accident = {} as Accident;
  captureDataUrl: string;
  accidentsItemRef$: FirebaseListObservable<Accident[]>;
  subscription: Subscription;
  cameraOptions: CameraOptions = {
    quality: 50,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE
  };

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private camera: Camera, private imageSrv: ImageProvider, private database: AngularFireDatabase,
    private afAuth: AngularFireAuth, private geolocation: Geolocation) {
  }

  ionViewWillEnter() {
    console.log(' ionViewWillEnter() AddaccidentPage ');
    this.accidentsItemRef$ = this.database.list('accidentitems');
  }

  onAddAccident(accident: Accident) {

    this.geolocation.getCurrentPosition().then((resp) => {
      let location = { lat: resp.coords.latitude, lng: resp.coords.longitude };
      accident.lat = resp.coords.latitude;
      accident.lng = resp.coords.longitude;
      console.log("imagename: " + this.accident.imagename);
      console.log("imageUrl: " + this.accident.imageUrl);
      accident.date=new Date();
      accident.status='NEW';
      this.accidentsItemRef$.push(accident);
      this.accident = {} as Accident;
      this.navCtrl.pop();

    }).catch((error) => {
      console.log('Error getting location', error);
    });

  }


  takePicAndUpload() {
    this.accident.imagename = UUID.UUID(); //only jpg format
    this.camera.getPicture(this.cameraOptions)
      .then(data => {
        let base64Image = 'data:image/jpeg;base64,' + data;
        this.captureDataUrl = base64Image;
        return this.imageSrv.uploadImage(base64Image, 'accidents', this.accident.imagename);
      })
      .then(data => {
        console.log("imagename :" + this.accident.imagename);
      });
  }

  logout() {
    this.subscription.unsubscribe();
    let addaccidentPage = this;
    this.afAuth.auth.signOut().then(function () {
      addaccidentPage.navCtrl.popToRoot();
    }, function (error) {
      console.log(error);
    });
  }

}
