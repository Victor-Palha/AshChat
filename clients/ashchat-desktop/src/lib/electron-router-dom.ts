import { createElectronRouter } from 'electron-router-dom'

export const { Router, registerRoute } = createElectronRouter({
  port: 5173, // a porta em que o seu servidor React está rodando (opcional, porta padrão é 3000)

  types: {
    /**
     * Os ids das janelas da sua aplicação, pense nesses ids como os basenames das rotas
     * essa nova forma permitirá que o intelisense do seu editor te ajude a saber quais ids estão disponíveis
     * tanto no main quanto no renderer process
     */
    ids: ['main'],
  },
})
