import { Drone } from "./Drone";

export class DroneEntrega extends Drone{
    constructor(id: number, 
        modelo: string,
        autonomiaBateria: number) {
    super(id, modelo, autonomiaBateria);
}
    voar(minutosVoo: number, minutosFilmagem: number = 0, cargaKg: number = 0): void {
        super.voar(minutosVoo, minutosFilmagem + (3 * cargaKg))
    }
}

