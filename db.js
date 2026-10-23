const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: "lumasat-aluno-9e7c.b.aivencloud.com", // Host exato da sua imagem
    port: 20312,                                 // Porta exata da sua imagem
    user: "avnadmin",                             // Utilizador exato da sua imagem
    password: "AVNS_4ODUOcgcZD_I1-F2cc5",   // Clique no olho da linha "Password" na imagem para copiar
    database: "defaultdb",                       // Base de dados exata da sua imagem
    multipleStatements: true,                     // Permite importar o ficheiro lumasat.sql de uma só vez
    ssl: {
        rejectUnauthorized: false                 // Exigido pelo Aiven (SSL mode: REQUIRED)
    }
});

conexao.connect((erro) => {
    if (erro) {
        console.log("❌ Erro ao conectar ao MySQL no Aiven:", erro);
        return;
    }
    console.log("✅ MySQL na nuvem (Aiven) conectado com sucesso!");
});

module.exports = conexao;