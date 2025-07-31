import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Material {
  nombre: string;
  cantidad: number;
  precio: number;
}

interface AlquilerItem {
  descripcion: string;
  precio: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>🎨 Calculadora de Presupuesto</h1>
        <p>Emprendimiento de Decoración</p>
      </header>

      <form [formGroup]="presupuestoForm" class="form-container">
        <!-- Información del Evento -->
        <div class="card">
          <h2>📋 Información del Evento</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre del Cliente</label>
              <input type="text" formControlName="nombreCliente" placeholder="Ej: María González">
            </div>
            <div class="form-group">
              <label>Tipo de Evento</label>
              <select formControlName="tipoEvento">
                <option value="">Seleccionar...</option>
                <option value="boda">Boda</option>
                <option value="cumpleanos">Cumpleaños</option>
                <option value="bautizo">Bautizo</option>
                <option value="graduacion">Graduación</option>
                <option value="empresarial">Evento Empresarial</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Fecha del Evento</label>
              <input type="date" formControlName="fechaEvento">
            </div>
            <div class="form-group">
              <label>Número de Invitados</label>
              <input type="number" formControlName="numeroInvitados" placeholder="Ej: 50">
            </div>
          </div>
        </div>

        <!-- Materias Primas -->
        <div class="card">
          <div class="card-header">
            <h2>🛍️ Materias Primas</h2>
            <button type="button" class="btn-add" (click)="agregarMaterial()">+ Agregar Material</button>
          </div>
          
          <div formArrayName="materiales" class="materials-list">
            <div *ngFor="let material of materiales.controls; let i = index" 
                 [formGroupName]="i" class="material-item">
              <div class="material-grid">
                <div class="form-group">
                  <label>Nombre del Material</label>
                  <input type="text" formControlName="nombre" placeholder="Ej: Flores artificiales">
                </div>
                <div class="form-group">
                  <label>Cantidad</label>
                  <input type="number" formControlName="cantidad" placeholder="1">
                </div>
                <div class="form-group">
                  <label>Precio Unitario (COP)</label>
                  <input type="number" formControlName="precio" placeholder="15000">
                </div>
                <button type="button" class="btn-remove" (click)="eliminarMaterial(i)">🗑️</button>
              </div>
              <div class="subtotal">
                Subtotal: {{ formatCurrency(getMaterialSubtotal(i)) }}
              </div>
            </div>
          </div>
          
          <div class="total-section">
            <strong>Total Materiales: {{ formatCurrency(getTotalMateriales()) }}</strong>
          </div>
        </div>

        <!-- Alquiler Extra (Opcional) -->
        <div class="card">
          <div class="card-header">
            <h2>🏠 Alquiler Extra (Opcional)</h2>
            <label class="toggle">
              <input type="checkbox" (change)="toggleAlquiler($event)">
              <span>Incluir alquiler</span>
            </label>
          </div>
          
          <div *ngIf="incluirAlquiler" formArrayName="alquiler" class="materials-list">
            <div class="form-group">
              <button type="button" class="btn-add" (click)="agregarAlquiler()">+ Agregar Item de Alquiler</button>
            </div>
            
            <div *ngFor="let item of alquiler.controls; let i = index" 
                 [formGroupName]="i" class="material-item">
              <div class="material-grid">
                <div class="form-group">
                  <label>Descripción</label>
                  <input type="text" formControlName="descripcion" placeholder="Ej: Sillas chiavari">
                </div>
                <div class="form-group">
                  <label>Precio (COP)</label>
                  <input type="number" formControlName="precio" placeholder="50000">
                </div>
                <button type="button" class="btn-remove" (click)="eliminarAlquiler(i)">🗑️</button>
              </div>
            </div>
            
            <div class="total-section">
              <strong>Total Alquiler: {{ formatCurrency(getTotalAlquiler()) }}</strong>
            </div>
          </div>
        </div>

        <!-- Costos Adicionales -->
        <div class="card">
          <h2>🚚 Costos Adicionales</h2>
          <div class="form-grid">
            <div class="form-group">
              <label>Costo de Transporte (COP)</label>
              <input type="number" formControlName="costoTransporte" placeholder="20000">
            </div>
            <div class="form-group">
              <label>Horas de Trabajo</label>
              <input type="number" formControlName="horasTrabajo" placeholder="8">
            </div>
            <div class="form-group">
              <label>Valor por Hora (COP)</label>
              <input type="number" formControlName="valorHora" placeholder="15000">
            </div>
            <div class="form-group">
              <label>Porcentaje de Ganancia (%)</label>
              <input type="number" formControlName="porcentajeGanancia" placeholder="30">
            </div>
          </div>
        </div>

        <!-- Resumen del Presupuesto -->
        <div class="card summary-card">
          <h2>💰 Resumen del Presupuesto</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <span>Materiales:</span>
              <span>{{ formatCurrency(getTotalMateriales()) }}</span>
            </div>
            <div class="summary-item" *ngIf="incluirAlquiler">
              <span>Alquiler:</span>
              <span>{{ formatCurrency(getTotalAlquiler()) }}</span>
            </div>
            <div class="summary-item">
              <span>Transporte:</span>
              <span>{{ formatCurrency(presupuestoForm.get('costoTransporte')?.value || 0) }}</span>
            </div>
            <div class="summary-item">
              <span>Mano de Obra ({{ presupuestoForm.get('horasTrabajo')?.value || 0 }}h):</span>
              <span>{{ formatCurrency(getCostoManoObra()) }}</span>
            </div>
            <div class="summary-item subtotal-item">
              <span>Subtotal:</span>
              <span>{{ formatCurrency(getSubtotal()) }}</span>
            </div>
            <div class="summary-item">
              <span>Ganancia ({{ presupuestoForm.get('porcentajeGanancia')?.value || 0 }}%):</span>
              <span>{{ formatCurrency(getGanancia()) }}</span>
            </div>
            <div class="summary-item total-item">
              <span><strong>TOTAL FINAL:</strong></span>
              <span><strong>{{ formatCurrency(getTotalFinal()) }}</strong></span>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="btn-primary" (click)="generarPresupuesto()">
            📄 Generar Presupuesto
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }

    .header {
      text-align: center;
      margin-bottom: 30px;
      color: white;
    }

    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .header p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .card {
      background: white;
      border-radius: 15px;
      padding: 25px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(0,0,0,0.15);
    }

    .card h2 {
      color: #2d3748;
      margin-bottom: 20px;
      font-size: 1.5rem;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 10px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .card-header h2 {
      margin-bottom: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      color: #4a5568;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
      padding: 12px 15px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .btn-add {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-add:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-remove {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-remove:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .btn-primary {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
      width: 100%;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }

    .materials-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .material-item {
      background: #f8fafc;
      padding: 20px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .material-item:hover {
      border-color: #cbd5e0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }

    .material-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr auto;
      gap: 15px;
      align-items: end;
    }

    .subtotal {
      margin-top: 10px;
      text-align: right;
      color: #059669;
      font-weight: 600;
    }

    .total-section {
      margin-top: 20px;
      padding-top: 15px;
      border-top: 2px solid #e2e8f0;
      text-align: right;
      font-size: 1.1rem;
      color: #2d3748;
    }

    .toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #4a5568;
    }

    .toggle input {
      transform: scale(1.2);
    }

    .summary-card {
      background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
      border: 2px solid #0ea5e9;
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      font-size: 1rem;
    }

    .subtotal-item {
      border-top: 1px solid #cbd5e0;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 1.1rem;
    }

    .total-item {
      border-top: 2px solid #2d3748;
      padding-top: 15px;
      margin-top: 10px;
      font-size: 1.3rem;
      color: #2d3748;
      background: rgba(45, 55, 72, 0.05);
      margin: 10px -15px -15px -15px;
      padding: 15px;
      border-radius: 0 0 13px 13px;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 15px;
      }

      .header h1 {
        font-size: 2rem;
      }

      .card {
        padding: 20px;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .material-grid {
        grid-template-columns: 1fr;
        gap: 10px;
      }

      .card-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }
    }
  `]
})
export class App {
  presupuestoForm: FormGroup;
  incluirAlquiler: boolean = false;

  constructor(private fb: FormBuilder) {
    this.presupuestoForm = this.fb.group({
      nombreCliente: ['', Validators.required],
      tipoEvento: ['', Validators.required],
      fechaEvento: ['', Validators.required],
      numeroInvitados: [0, [Validators.required, Validators.min(1)]],
      materiales: this.fb.array([]),
      alquiler: this.fb.array([]),
      costoTransporte: [0, [Validators.min(0)]],
      horasTrabajo: [0, [Validators.min(0)]],
      valorHora: [15000, [Validators.min(0)]],
      porcentajeGanancia: [30, [Validators.min(0), Validators.max(100)]]
    });

    // Agregar un material inicial
    this.agregarMaterial();
  }

  get materiales() {
    return this.presupuestoForm.get('materiales') as FormArray;
  }

  get alquiler() {
    return this.presupuestoForm.get('alquiler') as FormArray;
  }

  agregarMaterial() {
    const materialForm = this.fb.group({
      nombre: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
    this.materiales.push(materialForm);
  }

  eliminarMaterial(index: number) {
    if (this.materiales.length > 1) {
      this.materiales.removeAt(index);
    }
  }

  agregarAlquiler() {
    const alquilerForm = this.fb.group({
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]]
    });
    this.alquiler.push(alquilerForm);
  }

  eliminarAlquiler(index: number) {
    this.alquiler.removeAt(index);
  }

  toggleAlquiler(event: any) {
    this.incluirAlquiler = event.target.checked;
    if (!this.incluirAlquiler) {
      this.alquiler.clear();
    }
  }

  getMaterialSubtotal(index: number): number {
    const material = this.materiales.at(index);
    const cantidad = material.get('cantidad')?.value || 0;
    const precio = material.get('precio')?.value || 0;
    return cantidad * precio;
  }

  getTotalMateriales(): number {
    let total = 0;
    for (let i = 0; i < this.materiales.length; i++) {
      total += this.getMaterialSubtotal(i);
    }
    return total;
  }

  getTotalAlquiler(): number {
    if (!this.incluirAlquiler) return 0;
    
    let total = 0;
    for (let i = 0; i < this.alquiler.length; i++) {
      const item = this.alquiler.at(i);
      total += item.get('precio')?.value || 0;
    }
    return total;
  }

  getCostoManoObra(): number {
    const horas = this.presupuestoForm.get('horasTrabajo')?.value || 0;
    const valorHora = this.presupuestoForm.get('valorHora')?.value || 0;
    return horas * valorHora;
  }

  getSubtotal(): number {
    return this.getTotalMateriales() + 
           this.getTotalAlquiler() + 
           (this.presupuestoForm.get('costoTransporte')?.value || 0) + 
           this.getCostoManoObra();
  }

  getGanancia(): number {
    const subtotal = this.getSubtotal();
    const porcentaje = this.presupuestoForm.get('porcentajeGanancia')?.value || 0;
    return (subtotal * porcentaje) / 100;
  }

  getTotalFinal(): number {
    return this.getSubtotal() + this.getGanancia();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  generarPresupuesto() {
    if (this.presupuestoForm.valid) {
      const presupuesto = {
        ...this.presupuestoForm.value,
        totalFinal: this.getTotalFinal(),
        subtotal: this.getSubtotal(),
        ganancia: this.getGanancia(),
        fechaGeneracion: new Date().toLocaleDateString('es-CO')
      };
      
      console.log('Presupuesto generado:', presupuesto);
      alert(`¡Presupuesto generado exitosamente!\n\nTotal: ${this.formatCurrency(this.getTotalFinal())}\n\nRevisa la consola para ver todos los detalles.`);
    } else {
      alert('Por favor completa todos los campos requeridos.');
    }
  }
}

bootstrapApplication(App);