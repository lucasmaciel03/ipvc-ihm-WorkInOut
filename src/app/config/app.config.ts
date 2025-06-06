/**
 * Configuração global da aplicação
 * Centraliza constantes e configurações para fácil manutenção
 */
export const AppConfig = {
  appName: 'WorkInOut',
  theme: {
    primaryColor: '#ff6600',
    secondaryColor: '#000000',
    textColor: '#ffffff'
  },
  defaultLanguage: 'pt-PT',
  version: '1.0.0',
  storage: {
    userKey: 'workInOut_user',
    workoutsKey: 'workInOut_workouts',
    settingsKey: 'workInOut_settings'
  }
};
