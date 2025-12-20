import { Drone } from "./Drone";
import { DroneEntrega } from "./DroneEntrega";
import { DroneNaoEncontradoException } from "./Excecoes";
import { DroneInvalidoException } from "./Excecoes";

export class CentralDrones {
    private _drones: Drone[] = [];

    constructor (
        drones: Drone[] = []
    ){
        this._drones = drones;
    }

    cadastrar(drone: Drone): void {
        this._drones.push(drone);
    }

    consultar(id: number): Drone {
        if (id == null) {
            throw new DroneNaoEncontradoException('Drone não encontrado.');
        }
        let drone = this._drones.find(d => d.id === id);
        if (!drone) {
               throw new DroneNaoEncontradoException('Drone não encontrado.');
        }
        return drone;
    }

    listar(): Drone[] {
        return this._drones;
    }

    voar(id: number, minutosVoo: number, minutosFilmagem: number = 0, cargaKg: number = 0): void {
        let drone = this.consultar(id);
        if (cargaKg > 0 && !(drone instanceof DroneEntrega)) {
            throw new DroneInvalidoException('Drone inválido para carga.');
        }
        
            if (!('voar' in drone)) {
                throw new DroneNaoEncontradoException('Drone não encontrado.');
            }

        if (drone instanceof Drone) {
            if ('voar' in drone) {
                (drone as any).voar(minutosVoo, minutosFilmagem, cargaKg);
            }
        }
    }
}
