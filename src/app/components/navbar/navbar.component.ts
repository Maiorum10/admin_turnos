import { Component, OnInit, ElementRef } from '@angular/core';
import { ROUTES } from '../sidebar/sidebar.component';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { AccesoService } from 'src/app/servicios/acceso.service';
import { timer } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  nombre:any;
  apellido:any;
  numerou:any;
  hoy:any;
  public focus;
  public listTitles: any[];
  public location: Location;
  constructor(location: Location,  private element: ElementRef, private router: Router,
    private servicio:AccesoService) {
    this.location = location;
  }

  ngOnInit() {
    document.getElementById('noti').style.display = 'none';
    this.observableTimer();
    this.nombre=this.servicio.nombreSesion;
    this.apellido=this.servicio.apellidoSesion;
    this.fechajs();
    this.listTitles = ROUTES.filter(listTitle => listTitle);
    if(this.servicio.claveSesion=='123'){
      this.router.navigateByUrl("user-profile")
      Swal.fire('Actualice su clave','','warning');
    }
  }
  getTitle(){
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return 'Dashboard';
  }

  logout(){
    window.location.reload();
  }

  observableTimer() {
    const source = timer(1000, 5000);
    this.servicio.subscription = source.subscribe(val => {
      console.log(val, '-');
      this.consultarUltimo();
    });
  }

  consultarUltimo(){
    let body={
      'accion': 'consultar_ultimot',
      'id_departamento': this.servicio.id_departamentoSesion,
      'fecha': this.hoy
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          let ultimo=res.datos;
          let id_turno = ultimo[0].id_turno;
          this.numerou = ultimo[0].numero;
          this.comprobaciones();
        }else{

        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
}

fechajs(){
  const currentDate = new Date();

  const currentDayOfMonth = currentDate.getDate();
  const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
  const currentYear = currentDate.getFullYear();

  this.hoy = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
}

comprobaciones(){
  if(this.servicio.numero==0 && this.numerou!=1){
    document.getElementById('noti').style.display = 'none';
  }else if(this.servicio.numero==0 && this.numerou==1){
    document.getElementById('noti').style.display = 'block';
  }else if(this.servicio.numero!=0 && this.servicio.numero<this.numerou){
    document.getElementById('noti').style.display = 'block';
  }else{
    document.getElementById('noti').style.display = 'none';
  }
}

}
