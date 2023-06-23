import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AccesoService } from 'src/app/servicios/acceso.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrls: ['./tables.component.scss'],

})
export class TablesComponent implements OnInit {

  departamento:any;
  turnos:any;
  nuevo:any;
  hoy:any;
  f:any;
  public copy: string;
  constructor(private router: Router, private servicio:AccesoService,
    public datepipe: DatePipe) { }

  ngOnInit() {
    if(this.servicio.usuarioId=='0'){
      Swal.fire('Inicie sesión');
      this.router.navigateByUrl("login");
    }else if(this.servicio.rolSesion!='administrador'){
      Swal.fire('Pestaña administrativa');
      this.router.navigateByUrl("dashboard");
    }else{
      this.fechajs();
      this.departamento=this.servicio.departamentoSesion;
      this.turnos=this.servicio.turnosSesion;
      if(this.servicio.claveSesion=='123'){
        this.router.navigateByUrl("user-profile")
        Swal.fire('Actualice su clave','','warning');
      }
    }
  }

  fechajs(){
    const currentDate = new Date();

    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear();

    this.hoy = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
    console.log(this.hoy);
  }

  consultar(){
    if(this.nuevo==''){
      Swal.fire('Error','Ingrese una fecha','error');
    }else{
      let body={
        'accion':'consultar_fecha',
        'departamento': this.departamento,
        'fecha': this.f
      }
      return new Promise(resolve=>{
        this.servicio.postData(body).subscribe((res:any)=>{
          let usuario=res;
          if(res.estado){
            this.turnos=res.datos;
          }else{
              Swal.fire('No hay turnos en esa fecha','');
          }
        }, (err)=>{
          //Error
          console.log(err);
          Swal.fire('Error','Error de conexión','error');
        });
      });
    }
  }

  fecha(){
    this.f=this.nuevo;
    this.f = this.datepipe.transform(this.f, 'd-M-yyyy');
    this.consultar();
  }

}
