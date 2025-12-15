// Trabalho Final de POO
// Sistema de Jogo de Batalha

// Aluno: Eli Ruan dos Santos Carvalho


import * as fs from 'fs';
import * as readline from 'readline';


// CLASSE AÇÃO

export class Acao {
  constructor(
    public id: number,
    public origem: Personagem,
    public alvo: Personagem,
    public descricao: string,
    public valorDano: number,
    public dataHora: Date
  ) {}
}

// CLASSE PERSONAGEM

export abstract class Personagem {
  public historico: Acao[] = [];

  public ataquesBemSucedidos = 0;
  vidaMaxima: number;

  constructor(
    public id: number,
    public nome: string,
    public vida: number,
    public ataque: number
  ) {
    this.vidaMaxima = vida;
  }

  estaVivo(): boolean {
    return this.vida > 0;
  }

  // assinatura aceita atacante opcional
  receberDano(valor: number, atacante?: Personagem): void {
      if (!this.estaVivo()) {
          throw new Error(`${this.nome} está morto e não pode receber dano.`);
      }

      if (valor > 0 && atacante) {
          atacante.ataquesBemSucedidos++;
      }

      this.vida -= valor;
      if (this.vida < 0) this.vida = 0;
  }

  restaurarVidaTotal(): void {
    this.vida = this.vidaMaxima;
  }

  registrarAcao(acao: Acao): void {
    this.historico.push(acao);
  }

  abstract atacar(alvo: Personagem): Acao;
}

// GUERREIRO

export class Guerreiro extends Personagem {
  constructor(id: number, nome: string, vida: number, ataque: number, public defesa: number) {
    super(id, nome, vida, ataque);
  }

  atacar(alvo: Personagem): Acao {
    if (!this.estaVivo()) throw new Error(`${this.nome} está morto e não pode atacar.`);
    if (alvo === this) throw new Error(`Um personagem não pode atacar a si mesmo.`);

    let dano = this.ataque;
    if (this.vida < 30) dano = Math.floor(this.ataque * 1.3);

    let acao = new Acao(Date.now(), this, alvo, 'Ataque do Guerreiro', dano, new Date());
    alvo.receberDano(dano, this);
    this.registrarAcao(acao);

    return acao;
  }

  override receberDano(valor: number, atacante?: Personagem): void {
    if (!this.estaVivo()) {
        throw new Error(`${this.nome} está morto.`);
    }

    // ataque ignorado
    if (valor < this.defesa) return;

    const danoFinal = atacante instanceof Mago
        ? valor
        : Math.max(0, valor - this.defesa);

    // chama a regra padrão (contagem + redução de vida)
    super.receberDano(danoFinal, atacante);
}


}

// MAGO

export class Mago extends Personagem {
  atacar(alvo: Personagem): Acao {
    if (!this.estaVivo()) throw new Error(`${this.nome} está morto e não pode atacar.`);
    if (alvo === this) throw new Error(`Um personagem não pode atacar a si mesmo.`);

    let dano = this.ataque;
    if (alvo instanceof Arqueiro) dano *= 2;

    let acao = new Acao(Date.now(), this, alvo, 'Magia lançada', dano, new Date());
    alvo.receberDano(dano, this);
    this.registrarAcao(acao);

    // Autodano sempre ocorre (registrado)
    let auto = new Acao(Date.now(), this, this, 'Custo da magia', 10, new Date());
    this.vida -= 10;
    if (this.vida < 0) this.vida = 0;
    this.registrarAcao(auto);

    return acao;
  }
}

// ARQUEIRO

export class Arqueiro extends Personagem {
  constructor(id: number, nome: string, vida: number, ataque: number, public ataqueMultiplo: number) {
    super(id, nome, vida, ataque);
  }

  atacar(alvo: Personagem): Acao {
    if (!this.estaVivo()) throw new Error(`${this.nome} está morto e não pode atacar.`);
    if (alvo === this) throw new Error(`Um personagem não pode atacar a si mesmo.`);

    // Para fazer sorteio de tipo de ataque
    let multiplo = Math.random() < 0.5;
    let dano = multiplo ? this.ataque * this.ataqueMultiplo : this.ataque;
    let desc = multiplo ? 'Ataque múltiplo!' : 'Ataque simples';
    

    // Para ataque ser sempre simples
    // let dano = this.ataque;
    // let desc = 'Ataque simples';

    // Para ataque ser sempre múltiplo
    // let dano = this.ataque * this.ataqueMultiplo;
    // let desc = 'Ataque múltiplo!';

    let acao = new Acao(Date.now(), this, alvo, desc, dano, new Date());
    alvo.receberDano(dano, this);
    this.registrarAcao(acao);

    return acao;
  }
}

// CURANDEIRO

export class Curandeiro extends Personagem {

    atacar(): Acao {
        throw new Error('Curandeiro não realiza ataques.');
    }

    curar(alvo: Personagem): Acao {
        if (!alvo.estaVivo()) {
            throw new Error('Não é possível curar um personagem morto.');
        }

        alvo.restaurarVidaTotal();

        let acao = new Acao(
            Date.now(),
            this,
            alvo,
            'Cura completa realizada',
            0,
            new Date()
        );

        return acao;
    }
}



// BATALHA

export class Batalha {
  public personagens: Personagem[] = [];
  public acoes: Acao[] = [];

  adicionarPersonagem(p: Personagem): void {
    if (this.personagens.find(x => x.nome === p.nome)) throw new Error('Nome de personagem já existe.');
    this.personagens.push(p);
  }

  consultarPersonagem(nome: string): Personagem {
    let p = this.personagens.find(x => x.nome === nome);
    if (!p) throw new Error('Personagem não encontrado.');
    return p;
  }

  chamarCurandeiro(nome: string): void {
      const p = this.consultarPersonagem(nome);

      if (!p.estaVivo()) {
          throw new Error('Personagem morto não pode ser curado.');
      }

      if (p.vida === p.vidaMaxima) {
          throw new Error('A vida do personagem já está cheia.');
      }

      if (p.ataquesBemSucedidos < 5) {
          throw new Error('Personagem ainda não realizou 5 ataques bem-sucedidos.');
      }

      const curandeiro = new Curandeiro(999, 'Curandeiro', 999, 0);
      const acao = curandeiro.curar(p);

      this.acoes.push(acao);
      p.ataquesBemSucedidos = 0;
}

  turno(atacanteId: number, defensorId: number): Acao[] {
    let atacante = this.personagens.find(x => x.id === atacanteId);
    let defensor = this.personagens.find(x => x.id === defensorId);

    if (!atacante || !defensor) throw new Error('Personagem não encontrado.');
    if (!atacante.estaVivo()) throw new Error(`${atacante.nome} está morto e não pode atacar.`);
    if (!defensor.estaVivo()) throw new Error(`${defensor.nome} está morto e não pode ser atacado.`);

    let acao1 = atacante.atacar(defensor);
    this.acoes.push(acao1);

    // Se o atacante for Mago, o autodano já foi registrado no histórico do mago
    let novas = [acao1];
    if (atacante instanceof Mago) {
      // o último histórico do mago será o autodano registrado após o ataque
      let ultima = atacante.historico[atacante.historico.length - 1];
      this.acoes.push(ultima);
      novas.push(ultima);
    }

    return novas;
  }

  listarPersonagens(): Personagem[] {
    return this.personagens;
  }

  listarAcoes(): Acao[] {
    return this.acoes;
  }

  // retorna Personagem | null (corrige retorno null sem erro)
  verificarVencedor(): Personagem | null {
    let vivos = this.personagens.filter(p => p.estaVivo());
    if (vivos.length === 1) return vivos[0];
    if (vivos.length === 0) return null; // sem vencedor (todos mortos)
    return null; // ainda mais de um vivo -> sem vencedor definido
  }
}

// INTERFACE VIA TERMINAL

let batalha = new Batalha();

function salvar(): void {
  fs.writeFileSync('personagens.json', JSON.stringify(
    batalha.personagens.map(p => {
      // serializar propriedades específicas de cada tipo
      if (p instanceof Guerreiro) {
        return { id: p.id, tipo: 'Guerreiro', nome: p.nome, vida: p.vida, ataque: p.ataque, defesa: p.defesa };
      } else if (p instanceof Arqueiro) {
        return { id: p.id, tipo: 'Arqueiro', nome: p.nome, vida: p.vida, ataque: p.ataque, ataqueMultiplo: p.ataqueMultiplo };
      } else {
        return { id: p.id, tipo: 'Mago', nome: p.nome, vida: p.vida, ataque: p.ataque };
      }
    }), null, 2));
}

function carregar(): void {
  if (fs.existsSync('personagens.json')) {
    let dados = JSON.parse(fs.readFileSync('personagens.json', 'utf-8'));
    for (let d of dados) {
      if (d.defesa !== undefined) {
        batalha.adicionarPersonagem(new Guerreiro(d.id, d.nome, d.vida, d.ataque, d.defesa));
      } else if (d.ataqueMultiplo !== undefined) {
        batalha.adicionarPersonagem(new Arqueiro(d.id, d.nome, d.vida, d.ataque, d.ataqueMultiplo));
      } else {
        batalha.adicionarPersonagem(new Mago(d.id, d.nome, d.vida, d.ataque));
      }
    }
  }
}

carregar();

let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// === funções do menu (todas retornam void e chamam menu() no fim) ===

function criarPersonagem(): void {
  rl.question('Tipo (1-Guerreiro, 2-Mago, 3-Arqueiro): ', tipo => {
    rl.question('Nome: ', nome => {
      rl.question('Ataque (número): ', atkStr => {
        let atk = Number(atkStr);
        if (Number.isNaN(atk)) {
          console.log('Ataque inválido');
          return menu();
        }
        let id = Date.now();

        if (tipo === '1') {
          rl.question('Defesa (número): ', defStr => {
            let def = Number(defStr);
            if (Number.isNaN(def)) {
              console.log('Defesa inválida');
              return menu();
            }
            try {
              batalha.adicionarPersonagem(new Guerreiro(id, nome, 100, atk, def));
              console.log('Guerreiro criado!');            
            } catch (e: any) {
              console.log(`Erro: ${e.message}`);
            }
            return menu();
          });
        } else if (tipo === '2') {
          try {
            batalha.adicionarPersonagem(new Mago(id, nome, 100, atk));
            console.log('Mago criado!');
          } catch (e: any) {
            console.log(`Erro: ${e.message}`);
          }
          return menu();
        } else if (tipo === '3') {
          rl.question('Ataque múltiplo (número): ', amStr => {
            let am = Number(amStr);
            if (Number.isNaN(am)) {
              console.log('Ataque múltiplo inválido');
              return menu();
            }
            try {
              batalha.adicionarPersonagem(new Arqueiro(id, nome, 100, atk, am));
              console.log('Arqueiro criado!');
            } catch (e: any) {
              console.log(`Erro: ${e.message}`);
            }
            return menu();
          });
        } else {
          console.log('Tipo inválido');
          return menu();
        }
      });
    });
  });
}

function listarPersonagens(): void {
  console.log('\n=== Personagens ===');
  if (batalha.personagens.length === 0) {
    console.log('Nenhum personagem cadastrado.');
  } else {
    for (let p of batalha.personagens) {
      let tipo = p instanceof Guerreiro ? 'Guerreiro' : p instanceof Mago ? 'Mago' : 'Arqueiro';
      console.log(`${p.id} - ${p.nome} | Tipo: ${tipo} | Vida: ${p.vida} | Ataque: ${p.ataque} | Ataques bem-sucedidos: ${p.ataquesBemSucedidos}`);
    }
  }
  return menu();
}

function iniciarAtaque() {

    rl.question('Nome do atacante: ', nomeAtacante => {
        rl.question('Nome do defensor: ', nomeDefensor => {
            try {
                let atacante = batalha.consultarPersonagem(nomeAtacante);
                let defensor = batalha.consultarPersonagem(nomeDefensor);

                let acoes = batalha.turno(atacante.id, defensor.id);

                acoes.forEach(a =>
                    console.log(`${a.origem.nome} -> ${a.alvo.nome}: ${a.descricao} (${a.valorDano})`)
                );
            } catch (e: any) {
                console.log('Erro:', e.message);
            }
            menu();
        });
    });
}


function listarAcoes(): void {
  console.log('\n=== Ações ===');
  if (batalha.acoes.length === 0) {
    console.log('Nenhuma ação registrada.');
  } else {
    for (let a of batalha.acoes) {
      console.log(`${a.dataHora.toISOString()} - ${a.origem.nome} -> ${a.alvo.nome} | ${a.descricao} | Dano: ${a.valorDano}`);
    }
  }
  return menu();
}

function chamarCurandeiroMenu(): void {
    rl.question('Nome do personagem para curar: ', nome => {
        try {
            batalha.chamarCurandeiro(nome);
            console.log('Cura realizada com sucesso!');
        } catch (e: any) {
            console.log('Erro:', e.message);
        }
        menu();
    });
}


function vencedor(): void {
  let v = batalha.verificarVencedor();
  if (v) console.log(`Vencedor: ${v.nome} (Vida: ${v.vida})`);
  else console.log('Sem vencedor (todos mortos ou múltiplos vivos).');
  return menu();
}

function listarVivosEMortos(): void {
    console.log('\n=== PERSONAGENS VIVOS ===');
    batalha.personagens
        .filter(p => p.estaVivo())
        .forEach(p => {
            console.log(`- ${p.nome} (Vida: ${p.vida})`);
        });

    console.log('\n=== PERSONAGENS MORTOS ===');
    batalha.personagens
        .filter(p => !p.estaVivo())
        .forEach(p => {
            console.log(`- ${p.nome}`);
        });

    menu();
}

function resetarBatalha(): void {
    batalha.acoes = [];
    batalha.personagens = [];

    if (fs.existsSync('personagens.json')) {
        fs.unlinkSync('personagens.json');
    }

    console.log('Batalha Resetada com sucesso!');
    menu();
}


// MENU PRINCIPAL

function menu(): void {
  console.log('\n===== MENU =====\n');
  console.log('1 - Criar personagem');
  console.log('2 - Listar personagens');
  console.log('3 - Executar ataque');
  console.log('4 - Listar ações');
  console.log('5 - Verificar vencedor');
  console.log('6 - Listar vivos e mortos');
  console.log(`7 - Resetar batalha`);
  console.log('8 - Chamar curandeiro');
  console.log('0 - Sair\n');

  rl.question('Escolha: ', opcao => {
    if (opcao === '0') { salvar(); rl.close(); return; }
    if (opcao === '1') { criarPersonagem(); return; }
    if (opcao === '2') { listarPersonagens(); return; }
    if (opcao === '3') { iniciarAtaque(); return; }
    if (opcao === '4') { listarAcoes(); return; }
    if (opcao === '5') { vencedor(); return; }
    if (opcao === '6') { listarVivosEMortos(); return; }
    if (opcao === '7') { resetarBatalha(); return; }
    if (opcao === '8') { chamarCurandeiroMenu(); return; }
    console.log('\nOpção inválida!\n');
    return menu();
  });
}

menu();
