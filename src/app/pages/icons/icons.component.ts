import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AccesoService } from 'src/app/servicios/acceso.service';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.scss']
})
export class IconsComponent implements OnInit {

  departamento:any;
  turnos:any;
  nuevo:any;
  hoy:any;
  public copy: string;
  constructor(private router: Router, private servicio:AccesoService) { }

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

  guardar(){
    if(this.nuevo==''){
      Swal.fire('Error','No se puede guardar los turnos en blanco','error');
    }else{
      let body={
        'accion':'actualizar_turno',
        'nombre': this.departamento,
        'turnos_diarios': this.nuevo
      }
      return new Promise(resolve=>{
        this.servicio.postData(body).subscribe((res:any)=>{
          let usuario=res;
          if(res.estado){
              Swal.fire('Turnos actualizados');
              this.servicio.turnosSesion=this.nuevo;
              this.router.navigateByUrl("dashboard");
          }else{
              Swal.fire('Clave no actualizada','error');
          }
        }, (err)=>{
          //Error
          console.log(err);
          Swal.fire('Error','Error de conexión','error');
        });
      });
    }
  }
}
