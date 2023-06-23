import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AccesoService } from 'src/app/servicios/acceso.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss']
})
export class MapsComponent implements OnInit {

  numero:any;
  codigo:any;

  constructor(private router: Router, private servicio:AccesoService) { }

  ngOnInit() {

    if(this.servicio.usuarioId=='0'){
      Swal.fire('Inicie sesión');
      this.router.navigateByUrl("login");
    }

    if(this.servicio.claveSesion=='123'){
      this.router.navigateByUrl("user-profile")
      Swal.fire('Actualice su clave','','warning');
    }

    document.getElementById('btn_pdf').style.display = 'none';
    document.getElementById('content').style.display = 'none';
  }

  generar(){
    document.getElementById('btn_pdf').style.display = 'block';
    document.getElementById('content').style.display = 'block';
    document.getElementById('btn_generar').style.display = 'none';
    this.generaNss();
    this.consultar();
  }

  pdf(){
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a5');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', -35, position, fileWidth, fileHeight);
      PDF.save('timbre.pdf');
      this.router.navigateByUrl("dashboard");
    });
  }

  generaNss() {
    let result = '';
    const characters = '@ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 7; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        this.numero = result;
    }//this.numero='1000000'
}

consultar(){
  let body={
    'accion': 'consultar_timbres',
    'codigo': this.numero
  }
  return new Promise(resolve=>{
    this.servicio.postData(body).subscribe((res:any)=>{
      if(res.estado){
        console.log('no paso')
      }else{
        console.log('paso')
      }
    }, (err)=>{
      Swal.fire('Error','Error de conexión','error');
    });
  });
}

nuevo(){
  document.getElementById('btn_pdf').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  document.getElementById('btn_generar').style.display = 'none';
  this.guardar();
}

guardar(){
  let body={
    'accion': 'guardar_timbre',
    'codigo': this.numero
  }
  return new Promise(resolve=>{
    this.servicio.postData(body).subscribe((res:any)=>{
      if(res.estado){
        this.pdf();
        Swal.fire('Timbre creado con éxito','','success');
        this.router.navigateByUrl("dashboard");
      }else{
        Swal.fire('Error','Error','error');
      }
    }, (err)=>{
      Swal.fire('Error','Error de conexión','error');
    });
  });
}

}
