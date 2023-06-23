import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { AccesoService } from 'src/app/servicios/acceso.service';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "../../variables/charts";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public datasets: any;
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  id_turno:any;
  id_ultimo:any;
  nombre:any;
  apellido:any;
  cedula:any;
  numero:any;
  departamento:any;
  turnos_diarios:any;
  hoy:any;
  sn:any;
  turnos_hoy:any;
  time: number = 0;
  display:any='15:15';
  interval;
  min:any;

  constructor(private servicio: AccesoService,
    private router: Router) {}

  ngOnInit() {
    if(this.servicio.usuarioId=='0'){
      Swal.fire('Inicie sesión');
      this.router.navigateByUrl("login");
    }else{
      this.departamento=this.servicio.departamentoSesion;
      this.turnos_diarios=this.servicio.turnosSesion;
      this.fechajs();
      this.consultarturnos();
      this.consultarHoy();
      if(this.servicio.claveSesion=='123'){
        this.router.navigateByUrl("user-profile")
        Swal.fire('Actualice su clave','','warning');
      }
    }

    this.datasets = [
      [0, 20, 10, 30, 15, 40, 20, 60, 60],
      [0, 20, 5, 25, 10, 30, 15, 40, 40]
    ];
    this.data = this.datasets[0];


    var chartOrders = document.getElementById('chart-orders');

    parseOptions(Chart, chartOptions());


    var ordersChart = new Chart(chartOrders, {
      type: 'bar',
      options: chartExample2.options,
      data: chartExample2.data
    });

    var chartSales = document.getElementById('chart-sales');

    this.salesChart = new Chart(chartSales, {
			type: 'line',
			options: chartExample1.options,
			data: chartExample1.data
		});
  }


  public updateOptions() {
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
  }

  fechajs(){
    const currentDate = new Date();

    const currentDayOfMonth = currentDate.getDate();
    const currentMonth = currentDate.getMonth(); // Be careful! January is 0, not 1
    const currentYear = currentDate.getFullYear();

    this.hoy = currentDayOfMonth + "-" + (currentMonth + 1) + "-" + currentYear;
  }

  consultarturnos(){
    let body={
      'accion': 'consultar_turnos',
      'nombre': this.servicio.departamentoSesion,
      'fecha': this.hoy
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          let dep=res.datos;
          this.id_turno = dep[0].id_turno;
          this.nombre = dep[0].u_nombre;
          this.apellido = dep[0].u_apellido;
          this.cedula = dep[0].u_cedula;
          this.numero = dep[0].numero;
          this.servicio.numero=this.numero;
        }else{
          this.numero='';
          this.nombre='';
          this.apellido='';
          this.cedula='';
          Swal.fire('No hay turnos reservados para ' +this.servicio.departamentoSesion);
        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
  }

  desactivar(){
    if(this.turnos_diarios==this.numero){
      this.numero='';
      this.nombre='';
      this.apellido='';
      this.cedula='';
      Swal.fire('No hay más turnos para hoy');
      //this.ngOnInit();
    }else if(this.id_turno==this.id_ultimo){
      this.numero='';
      this.nombre='';
      this.apellido='';
      this.cedula='';
      Swal.fire('No hay más turnos, intente más tarde');
    }else if(this.servicio.numero==0){
      this.consultarSiguiente();
    }else{
      let body={
        'accion': 'desactivar_turno',
        'id_turno': this.id_turno,
        'tiempo': this.servicio.display
      }
      return new Promise(resolve=>{
        this.servicio.postData(body).subscribe((res:any)=>{
          if(res.estado){
            this.pauseTimer();
            this.consultarSiguiente();
          }else{
            this.numero='';
            this.nombre='';
            this.apellido='';
            this.cedula='';
            Swal.fire('No hay más turnos para hoy');
          }
        }, (err)=>{
          Swal.fire('Error','Error de conexión','error');
        });
      });
    }
  }

  activar(){
    let body={
      'accion': 'activar_turno',
      'id_turno': this.id_turno
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          Swal.fire('Siguiente turno: ' +this.numero);
          this.startTimer();
          this.ngOnInit();
        }else{
          this.numero='';
          this.nombre='';
          this.apellido='';
          this.cedula='';
          Swal.fire('No hay más turnos para hoy');
        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
  }

  consultarSiguiente(){
    let body={
      'accion': 'consultar_siguiente',
      'nombre': this.servicio.departamentoSesion,
      'fecha': this.hoy,
      'numero': this.servicio.numero*1+1
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          let dep=res.datos;
          this.id_turno = dep[0].id_turno;
          this.nombre = dep[0].u_nombre;
          this.apellido = dep[0].u_apellido;
          this.cedula = dep[0].u_cedula;
          this.numero = dep[0].numero;
          this.servicio.numero=this.numero;
          this.activar();
        }else{
          this.numero='';
          this.nombre='';
          this.apellido='';
          this.cedula='';
          Swal.fire('No hay más turnos reservados para ' +this.servicio.departamentoSesion);
        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
  }

  consultarUltimo(){
    this.consultarHoy();
    let body={
      'accion': 'consultar_ultimo',
      'nombre': this.servicio.departamentoSesion
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          let dep=res.datos;
          this.id_ultimo = dep[0].id_turno;
          this.servicio.id_ultimo=this.id_ultimo;
          this.desactivar();
        }else{

        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
  }

  consultarHoy(){
    let body={
      'accion': 'consultar_thoy',
      'fecha': this.hoy,
      'departamento': this.departamento
    }
    return new Promise(resolve=>{
      this.servicio.postData(body).subscribe((res:any)=>{
        if(res.estado){
          this.turnos_hoy=res.datos;
        }else{
          Swal.fire('No hay turnos','');
        }
      }, (err)=>{
        Swal.fire('Error','Error de conexión','error');
      });
    });
  }

  startTimer() {
    this.servicio.interval = setInterval(() => {
      if (this.servicio.time === 0) {
        this.servicio.time++;
      } else {
        this.servicio.time++;
      }
      this.servicio.display=this.transform(this.servicio.time)
    }, 1000);
  }
  transform(value: number): string {
       const minutes: number = Math.floor(value / 60);
       return minutes + ':' + (value - minutes * 60);
  }
  pauseTimer() {
    clearInterval(this.servicio.interval);
    this.servicio.time=0;
  }

}
