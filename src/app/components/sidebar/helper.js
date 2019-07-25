import { Icon, Style, Stroke, Circle, Fill } from 'ol/style';


export const stylesDespacho = {
    EmgesaHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/IconoPlantaEmgesaHidraulica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 2}),
    EmgesaTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/IconoPlantaEmgesaTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 2}),
    EmgesaFotovoltaica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/IconoPlantaEmgesaFotovoltaica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 2}),
    EmgesaEolica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/IconoPlantaEmgesaEolica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 2}),
    AgenteEPMTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/EPMTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteEPMHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/EMPHidrica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteValleTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/VALLETermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteYopalTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/YOPALTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteTasajeroTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/TASAJEROTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteProlecTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ProlecTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteNorteTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/NORTETermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteISATermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ISATermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteGCaribeTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/GCARIBETermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteESOCHTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ESOCHTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteENPCTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ENERGIAPACIFICOTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteCaliTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/EMCALITermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteCELTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/CELTermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteCandelariaTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/CANDELARIATermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteBquillaTermica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/BQUILLATermica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteAESHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/AESCHIVORHidro.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteEmurraHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/EMPRESAURRAHidro.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteENPCHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ENERGIAPACIFICOHidrica.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteISAHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/ISAHidro.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgenteLacasHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/LACASCADAHidro.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    AgentePorceHidraulica:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/PORCEHidro.png', scale: 0.041, anchor: [0.5, 1]}), zIndex: 0}),
    Otros:  new Style({
        image: new Icon({ src: './assets/icons/estaciones/IconoEstacionOtrosActiva.png', scale: 0.37, anchor: [0.5, 1]}), zIndex: 0}),
        
}