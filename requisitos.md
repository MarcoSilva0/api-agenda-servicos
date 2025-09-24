Chat analisando esses requisitos:
Instituto Federal de São Paulo - campus Barretos
Pós-Graduação lato senso em Programação para
Internet e Dispositivos Móveis
Desenvolvimento para Dispositivos Móveis II
Avaliação
Introdução
Nesta avaliação, você deverá desenvolver um aplicativo para ser utilizado como uma agenda
de serviços para pequenos negócios, de acordo com as especificações e restrições listadas neste
documento.
Forma de Avaliação
A avaliação levará em consideração as seguintes características do aplicativo desenvolvido:
• Correto atendimento do aplicativo em relação às especificações fornecidas neste docu-
mento;
• Utilização correta dos conceitos trabalhados na disciplina;
• Funcionamento correto, eficiente e seguro do aplicativo desenvolvido;
• Correta explanação dos conceitos utilizados no aplicativo;
• Correta explanação do funcionamento do aplicativo.
Formação de Grupos
Esta avaliação pode ser feita de forma individual ou em grupo de, no máximo, dois discentes,
a critério dos discentes.
Material a ser entregue
Deverá ser entregue o código-fonte do aplicativo, desenvolvido utilizando o framework React
Native com Expo.
Data de Entrega
O prazo máximo para a entrega do material solicitado é o dia 25/set/2025 às 18:00.
2
Forma de Entrega
A entrega deverá ser realizada em atividade cadastrada no Moodle institucional, disponível em
https://moodle.brt.ifsp.edu.br/. O código-fonte deve estar em repositório público no GitLab
ou GitHub, sendo o seu endereço informado no Moodle institucional.
1 Descrição geral do aplicativo 1
1 Descrição geral do aplicativo
O aplicativo a ser desenvolvido nesta avaliação deve ser utilizado pelos seus utilizadores de forma
a gerenciar atendimentos e serviços prestados por pequenas empresas, de forma a permitir um
fácil acesso e visualização destes dados ao utilizar o aplicativo.
2 Requisitos Funcionais
Os requisitos funcionais descrevem o comportamento do aplicativo e estão listados aqui em
ordem aleatória. Todo o comportamento descrito aqui é obrigatório e deve ser realizado. Incre-
mentos podem ser feitos, a critério do(s) discente(s), desde que não alterem o comportamento
dos requisitos.
2.1 RF01 - Primeira utilização
Na primeira utilização do aplicativo, deve-se apresentar uma mensagem de boas-vindas, exi-
bindo de forma rápida as principais funcionalidades do aplicativo. Após ver todas as mensagens
desta fase, passar à etapa de autenticação (ver RF02). A partir da segunda utilização do apli-
cativo, esta etapa não deve ser realizada.
2.2 RF02 - Entrada no sistema
Para utilizar o sistema, o usuário deve estar autenticado. Caso não esteja, permitir a criação
de uma conta nova, onde devem ser informados o nome do estabelecimento, e-mail, senha para
acesso, telefone, endereço e, opcionalmente, um logotipo do estabelecimento. Também informar
o ramo de atividade inicial da empresa (ver RF03). Os dados devem ser armazenados e, em caso
de sucesso, enviar um e-mail de confirmação ao e-mail informado. Uma vez que o usuário possua
uma conta, permitir a autenticação, que em caso de sucesso redireciona o usuário à tela principal
do aplicativo (ver RF07). Todos os dados informados nesta etapa podem ser alterados após a
autenticação no sistema. Verificar com o usuário o desejo de utilizar autenticação biométrica
ao invés da necessidade de informar e-mail/senha em toda autenticação.
2.3 RF03 - Ramo de atividade
O ramo de atividade deve ser utilizado para popular possíveis serviços comuns ao ramo esco-
lhido. Por exemplo, para uma oficina mecânica, os serviços comuns poderiam ser: troca de
óleo, troca de pneu, revisão, balanceamento, etc. Pode haver serviços favoritos de acordo com
o ramo de atividade. Os serviços de um ramo de atividade são definidos pelo desenvolvedor.
Ao criar um usuário, os serviços do ramo de atividade devem ser importados para os serviços
daquela empresa. A qualquer momento, é possível para o usuário importar serviços comuns de
outros ramos de atividade que não o ramo escolhido na primeira execução do aplicativo. Para
detalhes de serviços, ver RF04.
2.4 RF04 - Serviços
Indicam as atividades comerciais que as empresas realizam. Devem armazenar ao menos nome
e descrição. Serviços podem ser marcados como favoritos. Um usuário pode criar e gerenciar
serviços da forma que desejar.
2 Requisitos Funcionais 2
2.5 RF05 - Colaboradores
Colaboradores são pessoas que trabalham nas empresas. Armazenar de cada colaborador o
seu nome e, opcionalmente, uma foto. Deve ser possível informar os colaboradores que têm
preferência em realizar determinados serviços. A cada serviço podem ser vinculados vários
colaboradores. Um usuário pode criar e gerenciar colaboradores da forma que desejar.
2.6 RF06 - Agendamentos
Na tela principal do aplicativo, criar uma opção para realizar um agendamento, cujos dados
obrigatórios são: nome do cliente, telefone do cliente, data e horário, e serviço a ser realizado.
Opcionalmente, é possível informar o profissional que irá realizar o atendimento. Serviços favo-
ritos da empresa devem ser exibidos antes dos demais. Ao escolher um serviço, os colaboradores
que têm preferência deste serviço devem ser exibidos antes dos demais. Verificar se não há agen-
damentos para a data escolhida. Um usuário pode criar e gerenciar colaboradores da forma
que desejar.
2.7 RF07 - Calendário
Na tela inicial do sistema, mostrar os agendamentos do dia escolhido (abrir a tela com a data
atual), ordenados pelo horário. Destacar agendamentos em atraso. Deve ser possível alterar a
data, para visualizar agendamentos de outros dias.
2.8 RF08 - Atendimentos
Um atendimento deve ser realizado a partir de um agendamento. É possível alterar os ser-
viços agendados (tanto inserir novos como remover antigos). Ao menos um serviço deve ser
utilizado no atendimento. Adicionar colaboradores (opcional) que realizaram os serviços (dar
preferência/destaque na listagem de colaboradores para os que possuem preferência com o ser-
viço realizado). Ao finalizar um atendimento, voltar para a tela inicial e atualizar a lista de
atendimentos do dia corrente. É possível atualizar um atendimento já finalizado, mas ele não
pode voltar a ser um agendamento. Confirmar exclusão de agendamento.
2.9 RF09 - Tema do aplicativo
O usuário deve ter a opção de escolher o tema do aplicativo entre uma das três opções:
• Baseado no sistema operacional;
• Claro (light);
• Escuro (dark).
Projetar todas as telas para utilizar o tema desejado. Na primeira inicialização, utilizar o
padrão do sistema operacional.
2.10 RF10 - Compartilhamento
Para cada atendimento, permitir que o usuário copie um texto com os dados daquele aten-
dimento, para colar em um aplicativo de troca de mensagens, por exemplo. Opcionalmente,
permitir o compartilhamento deste texto com o cliente utilizando um aplicativo de troca de
mensagens. Deve ser criado pelo desenvolvedor um texto genérico, havendo a possibilidade de
alteração deste texto, pelo usuário, sem necessidade de alterar o código fonte.
2 Requisitos Funcionais 3
2.11 RF11 - Relatório de clientes
Criar uma tela que deve permitir que o usuário possa listar todos os clientes atendidos, exibindo
nome e telefone em ordem alfabética. Permitir que sejam filtrados clientes atendidos em um
determinado mês, ano ou intervalo. Permitir também a filtragem pelo nome do cliente.
2.12 RF12 - Recuperação de senha
Deve ser possível ao usuário solicitar a recuperação de senha, em caso de perda ou esquecimento.
Para isso, na tela de autenticação, informar o e-mail e, em caso positivo, enviar ao cliente um
código para troca da senha. A senha deve ser armazenada utilizando as melhores práticas de
segurança para o armazenamento de senhas.