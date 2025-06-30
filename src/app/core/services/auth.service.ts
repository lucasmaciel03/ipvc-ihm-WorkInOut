import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: string;
  primaryGoal?: string;
  createdAt: Date;
  lastLogin?: Date;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly USERS_KEY = "workinout_users";
  private readonly CURRENT_USER_KEY = "workinout_current_user";

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Verificar se há usuário logado ao inicializar
    this.loadCurrentUser();
  }

  /**
   * Carrega o usuário atual do localStorage
   */
  private loadCurrentUser(): void {
    const currentUserData = localStorage.getItem(this.CURRENT_USER_KEY);
    if (currentUserData) {
      const user = JSON.parse(currentUserData);
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Obtém todos os usuários do localStorage
   */
  private getUsers(): User[] {
    const usersData = localStorage.getItem(this.USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
  }

  /**
   * Salva a lista de usuários no localStorage
   */
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Verifica se um email já está registrado
   */
  emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Registra um novo usuário
   */
  register(
    userData: Omit<User, "id" | "createdAt">
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable((observer) => {
      try {
        // Verificar se o email já existe
        if (this.emailExists(userData.email)) {
          observer.next({
            success: false,
            message: "Este email já está registrado.",
          });
          observer.complete();
          return;
        }

        // Criar novo usuário
        const newUser: User = {
          id: this.generateUserId(),
          ...userData,
          createdAt: new Date(),
        };

        // Obter usuários existentes e adicionar o novo
        const users = this.getUsers();
        users.push(newUser);

        // Salvar no localStorage
        this.saveUsers(users);

        // Remover senha do objeto retornado por segurança
        const userWithoutPassword = { ...newUser };
        delete (userWithoutPassword as any).password;

        observer.next({
          success: true,
          message: "Conta criada com sucesso!",
          user: userWithoutPassword,
        });
        observer.complete();
      } catch (error) {
        observer.next({
          success: false,
          message: "Erro ao criar conta. Tente novamente.",
        });
        observer.complete();
      }
    });
  }

  /**
   * Realiza login do usuário
   */
  login(
    email: string,
    password: string
  ): Observable<{ success: boolean; message: string; user?: User }> {
    return new Observable((observer) => {
      try {
        const users = this.getUsers();
        const user = users.find(
          (u) =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );

        if (user) {
          // Atualizar último login
          user.lastLogin = new Date();
          this.saveUsers(users);

          // Salvar usuário atual
          const userWithoutPassword = { ...user };
          delete (userWithoutPassword as any).password;

          localStorage.setItem(
            this.CURRENT_USER_KEY,
            JSON.stringify(userWithoutPassword)
          );
          this.currentUserSubject.next(userWithoutPassword);

          observer.next({
            success: true,
            message: "Login realizado com sucesso!",
            user: userWithoutPassword,
          });
        } else {
          observer.next({
            success: false,
            message: "Email ou senha incorretos.",
          });
        }
        observer.complete();
      } catch (error) {
        observer.next({
          success: false,
          message: "Erro ao fazer login. Tente novamente.",
        });
        observer.complete();
      }
    });
  }

  /**
   * Realiza logout do usuário
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Verifica se o usuário está logado
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Gera um ID único para o usuário
   */
  private generateUserId(): string {
    return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Atualiza dados do usuário atual
   */
  updateUser(
    userData: Partial<User>
  ): Observable<{ success: boolean; message: string }> {
    return new Observable((observer) => {
      try {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
          observer.next({
            success: false,
            message: "Usuário não está logado.",
          });
          observer.complete();
          return;
        }

        const users = this.getUsers();
        const userIndex = users.findIndex((u) => u.id === currentUser.id);

        if (userIndex !== -1) {
          // Atualizar dados do usuário
          users[userIndex] = { ...users[userIndex], ...userData };
          this.saveUsers(users);

          // Atualizar usuário atual (sem senha)
          const updatedUserWithoutPassword = { ...users[userIndex] };
          delete (updatedUserWithoutPassword as any).password;

          localStorage.setItem(
            this.CURRENT_USER_KEY,
            JSON.stringify(updatedUserWithoutPassword)
          );
          this.currentUserSubject.next(updatedUserWithoutPassword);

          observer.next({
            success: true,
            message: "Dados atualizados com sucesso!",
          });
        } else {
          observer.next({
            success: false,
            message: "Usuário não encontrado.",
          });
        }
        observer.complete();
      } catch (error) {
        observer.next({
          success: false,
          message: "Erro ao atualizar dados.",
        });
        observer.complete();
      }
    });
  }
}
