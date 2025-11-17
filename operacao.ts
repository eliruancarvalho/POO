import Conta from "./conta";

export default class Operacao{
    private _id: number;
    private _conta: Conta[] = [];
    private _tipo: string;
    private _valor: number;
    private _descricao: string;
    private _dataHora: Date;   

    constructor(id: number, tipo: string, valor: number, descricao: string, dataHora: Date,){
        this._id = id;
        this._tipo = tipo;
        this._valor = valor;
        this._descricao = descricao;
        this._dataHora = dataHora;
    }  

    
    public get id(){
        return this._id;
    }

    public get conta(){
        return this._conta;
    }

    public get tipo(){
        
        return this._tipo;
    }

    public get valor(){
        return this._valor;
    }

    public get descricao(){
        return this._descricao;
    }

    public get dataHora(){
        return this._dataHora;
    }

    public set descricao(texto: string){
        this._descricao = texto;
    }

}


