const fs = require("fs");
const db = require("./db");

try {
    const sqlScript = fs.readFileSync("./lumasat.sql", "utf8");

    console.log("A enviar a estrutura do lumasat.sql para o Aiven...");

    db.query(sqlScript, (erro) => {
        if (erro) {
            console.error("❌ Erro ao importar o ficheiro SQL:", erro);
        } else {
            console.log("✅ Ficheiro lumasat.sql importado com sucesso para a nuvem!");
        }
        process.exit();
    });
} catch (err) {
    console.error("❌ Ficheiro lumasat.sql não encontrado na raiz do projeto.", err);
    process.exit();
}