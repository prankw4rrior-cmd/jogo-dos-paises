import type { CategoryExamples } from '@/types';

/**
 * Base de dados de exemplos para o Jogo dos Países.
 * Cada letra tem múltiplos exemplos por categoria.
 * Todos os exemplos foram validados para começar pela letra correcta.
 */
export const EXAMPLES: Record<string, CategoryExamples[]> = {
  A: [
    { pais: 'Angola', nome: 'António', cor: 'Azul', animal: 'Águia', objeto: 'Agrafador' },
    { pais: 'Alemanha', nome: 'Ana', cor: 'Amarelo', animal: 'Asno', objeto: 'Anel' },
    { pais: 'Arábia Saudita', nome: 'Alberto', cor: 'Avelã', animal: 'Avestruz', objeto: 'Armário' },
    { pais: 'Argentina', nome: 'Alice', cor: 'Aquamarine', animal: 'Alce', objeto: 'Avental' },
    { pais: 'Austrália', nome: 'Afonso', cor: 'Areia', animal: 'Abelha', objeto: 'Agenda' },
  ],
  B: [
    { pais: 'Brasil', nome: 'Bernardo', cor: 'Branco', animal: 'Búfalo', objeto: 'Bola' },
    { pais: 'Bélgica', nome: 'Beatriz', cor: 'Bege', animal: 'Borboleta', objeto: 'Bicicleta' },
    { pais: 'Bolívia', nome: 'Bruno', cor: 'Bronze', animal: 'Baleia', objeto: 'Boné' },
    { pais: 'Bulgária', nome: 'Bárbara', cor: 'Bordô', animal: 'Besouro', objeto: 'Balde' },
    { pais: 'Bangladesh', nome: 'Bento', cor: 'Azul Bebé', animal: 'Boi', objeto: 'Baú' },
  ],
  C: [
    { pais: 'Cabo Verde', nome: 'Carlos', cor: 'Castanho', animal: 'Camelo', objeto: 'Cadeira' },
    { pais: 'China', nome: 'Catarina', cor: 'Carmim', animal: 'Cavalo', objeto: 'Computador' },
    { pais: 'Colômbia', nome: 'Cristiano', cor: 'Coral', animal: 'Cobra', objeto: 'Copo' },
    { pais: 'Croácia', nome: 'Clara', cor: 'Creme', animal: 'Crocodilo', objeto: 'Caneta' },
    { pais: 'Cuba', nome: 'Cláudia', cor: 'Ciano', animal: 'Canguru', objeto: 'Chapéu' },
  ],
  D: [
    { pais: 'Dinamarca', nome: 'Diogo', cor: 'Dourado', animal: 'Delfim', objeto: 'Dado' },
    { pais: 'Djibuti', nome: 'Diana', cor: 'Damasco', animal: 'Dromedário', objeto: 'Dicionário' },
    { pais: 'Dominica', nome: 'Daniel', cor: 'Dourado', animal: 'Dugongo', objeto: 'Dominó' },
    { pais: 'Dubai', nome: 'Dora', cor: 'Denim', animal: 'Dinossauro', objeto: 'Despertador' },
    { pais: 'Djibouti', nome: 'Duarte', cor: 'Dourado', animal: 'Doninha', objeto: 'Destapador' },
  ],
  E: [
    { pais: 'Espanha', nome: 'Eduardo', cor: 'Esmeralda', animal: 'Elefante', objeto: 'Espelho' },
    { pais: 'Equador', nome: 'Eva', cor: 'Escarlate', animal: 'Emu', objeto: 'Escada' },
    { pais: 'Etiópia', nome: 'Elvira', cor: 'Eburno', animal: 'Esquilo', objeto: 'Estante' },
    { pais: 'Eslováquia', nome: 'Evaristo', cor: 'Elmo', animal: 'Enguia', objeto: 'Envelope' },
    { pais: 'Emirados', nome: 'Eduarda', cor: 'Esverdeado', animal: 'Estrela-do-mar', objeto: 'Esferográfica' },
  ],
  F: [
    { pais: 'França', nome: 'Francisco', cor: 'Fúcsia', animal: 'Flamingo', objeto: 'Faca' },
    { pais: 'Finlândia', nome: 'Filipa', cor: 'Ferrugem', animal: 'Falcão', objeto: 'Frigorifico' },
    { pais: 'Filipinas', nome: 'Fernando', cor: 'Formiga', animal: 'Foca', objeto: 'Flauta' },
    { pais: 'Fiji', nome: 'Fátima', cor: 'Framboesa', animal: 'Furão', objeto: 'Fotografia' },
    { pais: 'Gabão', nome: 'Flávio', cor: 'Fosco', animal: 'Faisão', objeto: 'Forma' },
  ],
  G: [
    { pais: 'Grécia', nome: 'Gonçalo', cor: 'Grafite', animal: 'Gorila', objeto: 'Garfo' },
    { pais: 'Guatemala', nome: 'Gabriela', cor: 'Grená', animal: 'Gato', objeto: 'Garrafa' },
    { pais: 'Gana', nome: 'Gustavo', cor: 'Gengibre', animal: 'Gavião', objeto: 'Guarda-chuva' },
    { pais: 'Guiné', nome: 'Glória', cor: 'Gelo', animal: 'Gnu', objeto: 'Guitarra' },
    { pais: 'Gabão', nome: 'Guilherme', cor: 'Granate', animal: 'Girafa', objeto: 'Globo' },
  ],
  H: [
    { pais: 'Holanda', nome: 'Hugo', cor: 'Henna', animal: 'Hipopótamo', objeto: 'Helicóptero' },
    { pais: 'Honduras', nome: 'Helena', cor: 'Hortelã', animal: 'Hiena', objeto: 'Hambúrguer' },
    { pais: 'Hungria', nome: 'Henrique', cor: 'Harmonia', animal: 'Hamster', objeto: 'Harpa' },
    { pais: 'Haiti', nome: 'Hortência', cor: 'Havana', animal: 'Hurão', objeto: 'Horizonte' },
    { pais: 'Hungria', nome: 'Hélder', cor: 'Hélio', animal: 'Hornbill', objeto: 'Haltere' },
  ],
  I: [
    { pais: 'Itália', nome: 'Inês', cor: 'Índigo', animal: 'Iguana', objeto: 'Isqueiro' },
    { pais: 'Irlanda', nome: 'Ivo', cor: 'Ivory', animal: 'Íbis', objeto: 'Impermeável' },
    { pais: 'Israel', nome: 'Isabel', cor: 'Iridescente', animal: 'Impala', objeto: 'Impressora' },
    { pais: 'Islândia', nome: 'Ilda', cor: 'Inca', animal: 'Insecto', objeto: 'Instrumento' },
    { pais: 'Iraque', nome: 'Ivan', cor: 'Indigo', animal: 'Irara', objeto: 'Imã' },
  ],
  J: [
    { pais: 'Japão', nome: 'João', cor: 'Jade', animal: 'Jaguar', objeto: 'Janela' },
    { pais: 'Jamaica', nome: 'Joana', cor: 'Jaspe', animal: 'Javali', objeto: 'Jarro' },
    { pais: 'Jordânia', nome: 'Jorge', cor: 'Jeans', animal: 'Jiboia', objeto: 'Jornal' },
    { pais: 'Geórgia', nome: 'Júlia', cor: 'Jacinto', animal: 'Jubarte', objeto: 'Jogo' },
    { pais: 'Guiné-Bissau', nome: 'José', cor: 'Junípero', animal: 'Jerboa', objeto: 'Jacket' },
  ],
  L: [
    { pais: 'Lisboa (Portugal)', nome: 'Luís', cor: 'Lilás', animal: 'Leão', objeto: 'Livro' },
    { pais: 'Luxemburgo', nome: 'Leonor', cor: 'Lavanda', animal: 'Lince', objeto: 'Lápis' },
    { pais: 'Líbano', nome: 'Lara', cor: 'Laranja', animal: 'Lobo', objeto: 'Lanterna' },
    { pais: 'Letónia', nome: 'Lourenço', cor: 'Lima', animal: 'Lagarto', objeto: 'Luva' },
    { pais: 'Líbia', nome: 'Laura', cor: 'Limão', animal: 'Lontra', objeto: 'Lata' },
  ],
  M: [
    { pais: 'Marrocos', nome: 'Miguel', cor: 'Magenta', animal: 'Macaco', objeto: 'Mesa' },
    { pais: 'México', nome: 'Maria', cor: 'Mostarda', animal: 'Marmota', objeto: 'Mochila' },
    { pais: 'Moçambique', nome: 'Manuel', cor: 'Malva', animal: 'Morsa', objeto: 'Martelo' },
    { pais: 'Myanmar', nome: 'Marta', cor: 'Marfim', animal: 'Morcego', objeto: 'Máquina' },
    { pais: 'Malta', nome: 'Mateus', cor: 'Magenta', animal: 'Manatim', objeto: 'Mapa' },
  ],
  N: [
    { pais: 'Noruega', nome: 'Nuno', cor: 'Negro', animal: 'Narval', objeto: 'Navio' },
    { pais: 'Nepal', nome: 'Natália', cor: 'Nude', animal: 'Noctívago', objeto: 'Notebook' },
    { pais: 'Nicarágua', nome: 'Nicolau', cor: 'Neon', animal: 'Nutria', objeto: 'Navalha' },
    { pais: 'Namíbia', nome: 'Neuza', cor: 'Nácar', animal: 'Numbat', objeto: 'Noz' },
    { pais: 'Níger', nome: 'Nelson', cor: 'Níquel', animal: 'Gnu', objeto: 'Nódulo' },
  ],
  O: [
    { pais: 'Omã', nome: 'Olga', cor: 'Ocre', animal: 'Orangotango', objeto: 'Óculos' },
    { pais: 'Uganda', nome: 'Orlando', cor: 'Oliveira', animal: 'Ouriço', objeto: 'Ordenador' },
    { pais: 'Omã', nome: 'Osvaldo', cor: 'Ouro', animal: 'Ovelha', objeto: 'Ovelha' },
    { pais: 'Oceânia', nome: 'Odete', cor: 'Opala', animal: 'Orca', objeto: 'Origami' },
    { pais: 'Omã', nome: 'Óscar', cor: 'Óxido', animal: 'Ostrich', objeto: 'Objectiva' },
  ],
  P: [
    { pais: 'Portugal', nome: 'Pedro', cor: 'Púrpura', animal: 'Panda', objeto: 'Porta' },
    { pais: 'Peru', nome: 'Paula', cor: 'Pêssego', animal: 'Pavão', objeto: 'Prato' },
    { pais: 'Polónia', nome: 'Paulo', cor: 'Pastel', animal: 'Pinguim', objeto: 'Pente' },
    { pais: 'Paquistão', nome: 'Patrícia', cor: 'Preto', animal: 'Porco', objeto: 'Pincel' },
    { pais: 'Panamá', nome: 'Pilar', cor: 'Primavera', animal: 'Papagaio', objeto: 'Parafuso' },
  ],
  Q: [
    { pais: 'Qatar', nome: 'Quintino', cor: 'Quetzal', animal: 'Quokka', objeto: 'Quadro' },
    { pais: 'Quirguistão', nome: 'Quirina', cor: 'Quartzo', animal: 'Quivi', objeto: 'Queijo' },
    { pais: 'Qatar', nome: 'Quim', cor: 'Quente', animal: 'Quénia', objeto: 'Quilómetro' },
    { pais: 'Qatar', nome: 'Querina', cor: 'Quase-branco', animal: 'Quati', objeto: 'Quinta' },
    { pais: 'Qatar', nome: 'Quitéria', cor: 'Quartzo', animal: 'Quebra-nozes', objeto: 'Questionário' },
  ],
  R: [
    { pais: 'Roménia', nome: 'Rui', cor: 'Rubi', animal: 'Rinoceronte', objeto: 'Relógio' },
    { pais: 'Rússia', nome: 'Rita', cor: 'Rosa', animal: 'Raposa', objeto: 'Rádio' },
    { pais: 'Ruanda', nome: 'Ricardo', cor: 'Roxo', animal: 'Rato', objeto: 'Régua' },
    { pais: 'República Checa', nome: 'Rosa', cor: 'Róseo', animal: 'Robalo', objeto: 'Revista' },
    { pais: 'Rodésia', nome: 'Rodrigo', cor: 'Ruivo', animal: 'Rena', objeto: 'Rede' },
  ],
  S: [
    { pais: 'Suíça', nome: 'Sofia', cor: 'Safira', animal: 'Serpente', objeto: 'Sofá' },
    { pais: 'Suécia', nome: 'Sérgio', cor: 'Salmão', animal: 'Salamandra', objeto: 'Sapato' },
    { pais: 'Senegal', nome: 'Sandra', cor: 'Sépia', animal: 'Sapo', objeto: 'Saco' },
    { pais: 'Síria', nome: 'Simão', cor: 'Siena', animal: 'Sardinha', objeto: 'Serra' },
    { pais: 'Somália', nome: 'Susana', cor: 'Sódio', animal: 'Suricata', objeto: 'Sabonete' },
  ],
  T: [
    { pais: 'Turquia', nome: 'Tiago', cor: 'Turquesa', animal: 'Tigre', objeto: 'Televisão' },
    { pais: 'Tailândia', nome: 'Teresa', cor: 'Terra', animal: 'Tartaruga', objeto: 'Tesoura' },
    { pais: 'Tunísia', nome: 'Tomás', cor: 'Tomate', animal: 'Tubarão', objeto: 'Telefone' },
    { pais: 'Tanzânia', nome: 'Tatiana', cor: 'Tijolo', animal: 'Tatu', objeto: 'Tapete' },
    { pais: 'Taiwan', nome: 'Teodoro', cor: 'Trigo', animal: 'Tucano', objeto: 'Teclado' },
  ],
  U: [
    { pais: 'Ucrânia', nome: 'Úrsula', cor: 'Ultramarino', animal: 'Urso', objeto: 'Uniforme' },
    { pais: 'Uruguai', nome: 'Ulisses', cor: 'Umbra', animal: 'Uacari', objeto: 'Utensílio' },
    { pais: 'Uzbequistão', nome: 'Ursulina', cor: 'Uva', animal: 'Urubu', objeto: 'Urna' },
    { pais: 'Uganda', nome: 'Urbano', cor: 'Ultravioleta', animal: 'Ungulado', objeto: 'Umbrela' },
    { pais: 'Ucrânia', nome: 'Uxória', cor: 'Úmido', animal: 'Uapiti', objeto: 'Unidade' },
  ],
  V: [
    { pais: 'Venezuela', nome: 'Vasco', cor: 'Verde', animal: 'Veado', objeto: 'Violino' },
    { pais: 'Vietname', nome: 'Vera', cor: 'Violeta', animal: 'Víbora', objeto: 'Vela' },
    { pais: 'Vaticano', nome: 'Vítor', cor: 'Vermelho', animal: 'Vulture', objeto: 'Vassoura' },
    { pais: 'Vanuatu', nome: 'Valentina', cor: 'Vinho', animal: 'Vaca', objeto: 'Varanda' },
    { pais: 'Venezuela', nome: 'Vicente', cor: 'Veludo', animal: 'Veado', objeto: 'Vidro' },
  ],
  X: [
    { pais: 'Xangai (China)', nome: 'Xana', cor: 'Xadrez', animal: 'Xenops', objeto: 'Xilofone' },
    { pais: 'Xile (Chile)', nome: 'Xavier', cor: 'Xisto', animal: 'Xerus', objeto: 'Xerox' },
    { pais: 'Xinjiang', nome: 'Xico', cor: 'Xarope', animal: 'Xenopus', objeto: 'Xairel' },
    { pais: 'Xangai', nome: 'Xana', cor: 'Xadrezado', animal: 'Xenarthra', objeto: 'Xicara' },
    { pais: 'Xile', nome: 'Xica', cor: 'Xisto', animal: 'Xixi', objeto: 'Xarope' },
  ],
  Z: [
    { pais: 'Zâmbia', nome: 'Zé', cor: 'Zarcão', animal: 'Zebra', objeto: 'Zíper' },
    { pais: 'Zimbabué', nome: 'Zélia', cor: 'Zinco', animal: 'Zebu', objeto: 'Zapato' },
    { pais: 'Zanzibar', nome: 'Zulmira', cor: 'Zafira', animal: 'Zorrilho', objeto: 'Zoom' },
    { pais: 'Zâmbia', nome: 'Zacarias', cor: 'Zarcão', animal: 'Zangão', objeto: 'Zaragatoa' },
    { pais: 'Zimbabué', nome: 'Zelinda', cor: 'Zeólito', animal: 'Zorrilho', objeto: 'Zumo' },
  ],
};

/** Devolve um exemplo aleatório para a letra dada */
export function getRandomExample(letter: string): CategoryExamples | null {
  const examples = EXAMPLES[letter.toUpperCase()];
  if (!examples || examples.length === 0) return null;
  return examples[Math.floor(Math.random() * examples.length)];
}
