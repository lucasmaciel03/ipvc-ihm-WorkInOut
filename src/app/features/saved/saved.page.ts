import { Component, OnInit } from "@angular/core";
import { IonicModule, ModalController, AlertController, ToastController } from "@ionic/angular";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { WorkoutService } from "../../services/workout.service";
import { WorkoutDetailModalComponent } from "../../components/workout-detail-modal/workout-detail-modal.component";

@Component({
  selector: "app-saved",
  templateUrl: "./saved.page.html",
  styleUrls: ["./saved.page.scss"],
  standalone: false,
})
export class SavedPage implements OnInit {
  savedPrograms: any[] = [];
  filteredPrograms: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;
  isEmpty: boolean = false;
  
  constructor(
    private workoutService: WorkoutService,
    private modalCtrl: ModalController,
    private alertController: AlertController,
    private toastCtrl: ToastController
  ) {}
  
  ngOnInit() {
    this.loadSavedPrograms();
  }
  
  ionViewWillEnter() {
    // Recarregar programas sempre que a página for exibida
    this.loadSavedPrograms();
  }
  
  /**
   * Carrega os programas guardados do serviço
   */
  loadSavedPrograms() {
    this.isLoading = true;
    
    setTimeout(() => {
      this.savedPrograms = this.workoutService.getSavedPrograms();
      this.filteredPrograms = [...this.savedPrograms];
      this.isEmpty = this.savedPrograms.length === 0;
      this.isLoading = false;
    }, 500); // Pequeno delay para mostrar o loading
  }
  
  /**
   * Filtra os programas com base no termo de pesquisa
   */
  filterPrograms() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredPrograms = [...this.savedPrograms];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPrograms = this.savedPrograms.filter(program => 
      program.nome_programa.toLowerCase().includes(term) ||
      program.descricao.toLowerCase().includes(term) ||
      (program.tags && program.tags.some((tag: string) => tag.toLowerCase().includes(term)))
    );
  }
  
  /**
   * Abre o modal de detalhes do programa
   */
  async openProgramDetails(program: any) {
    const modal = await this.modalCtrl.create({
      component: WorkoutDetailModalComponent,
      componentProps: {
        program: program
      },
      cssClass: 'workout-detail-modal'
    });
    
    await modal.present();
    
    // Atualizar a lista após o modal ser fechado
    const { data } = await modal.onDidDismiss();
    this.loadSavedPrograms();
  }
  
  /**
   * Remove um programa dos favoritos
   */
  async removeProgram(program: any, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que o card seja clicado
    }
    
    const alert = await this.alertController.create({
      header: 'Remover programa',
      message: `Tens a certeza que queres remover "${program.nome_programa}" dos favoritos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            if (this.workoutService.removeProgram(program)) {
              this.loadSavedPrograms();
              this.showToast('Programa removido dos favoritos', 'medium');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }
  
  /**
   * Limpa o termo de pesquisa
   */
  clearSearch() {
    this.searchTerm = '';
    this.filterPrograms();
  }
  
  /**
   * Mostra uma mensagem toast ao utilizador
   */
  async showToast(message: string, color: string = 'primary', duration: number = 2000) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: 'bottom',
      color: color,
      cssClass: 'custom-toast'
    });
    await toast.present();
  }
}
