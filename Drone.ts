import { AutonomiaBateriaException } from "./Excecoes";

export class Drone {
    private _id: number;
    private _modelo: string;
    private _autonomiaBateria: number;

    constructor(
        id: number, 
        modelo: string,
        autonomiaBateria: number
    ) {
        this._id = id;
        this._modelo = modelo;
        this._autonomiaBateria = autonomiaBateria
    }
        get id(): number { return this._id; }
        get modelo(): string { return this._modelo; }
        get autonomiaBateria(): number { return this._autonomiaBateria; }


    voar(minutosVoo: number, minutosFilmagem: number): void {
        let consumoTotal = (2 * minutosVoo + minutosFilmagem);
        if (this.autonomiaBateria < consumoTotal){ 
            throw new AutonomiaBateriaException('Bateria Insuficiente');
        }
        else {
            this._autonomiaBateria = this.autonomiaBateria - consumoTotal;
        }

    }

}

