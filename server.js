const express = require("express");
const db = require("./db");
const path = require("path");
const fs = require("fs");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static("public", { extensions: ["html"] }));
app.use(express.urlencoded({ extended: true }));

// Função auxiliar para ler o ficheiro JSON
function lerMaquinas() {
    try {
        const data = fs.readFileSync("./public/maquinas.json", "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Erro ao ler maquinas.json:", err);
        return [];
    }
}

// ROTA: Cadastrar Utilizador com Empresa
app.post("/cadastrar", (req, res) => {
    const { email, senha, nome, empresa, confirmarSenha } = req.body;

    if (senha !== confirmarSenha) {
        return res.send("As senhas não são iguais");
    }

    const sql = `
        INSERT INTO login(email, senha, nome, empresa) 
        VALUES (?,?,?,?)
    `;

    db.query(sql, [email, senha, nome, empresa], (erro, resultado) => {
        if (erro) {
            console.error("Erro no MYSQL:", erro);
            return res.send("Erro ao cadastrar");
        }
        res.redirect("/login");
    });
});

// ROTA: Autenticação / Login
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const sql = `
        SELECT * FROM login
        WHERE email = ? AND senha = ?
    `;

    db.query(sql, [email, senha], (erro, resultado) => {
        if (erro) {
            console.error("Erro no MySQL:", erro);
            return res.send("Erro no login");
        }

        if (resultado.length > 0) {
            const usuarioLogado = resultado[0];
            // Envia o e-mail via Query Parameter para a dashboard
            res.redirect(`/dashboard?email=${encodeURIComponent(usuarioLogado.email)}`);
        } else {
            res.redirect("/login.html?erro=true");
        }
    });
});

// ROTA: Buscar dados do Utilizador Logado
// ROTA: Buscar dados do Utilizador Específico
app.get("/api/usuario", (req, res) => {
    const emailReq = req.query.email;

    if (!emailReq) {
        return res.status(400).json({ erro: "E-mail do utilizador não fornecido" });
    }

    const sql = "SELECT nome, email, empresa FROM login WHERE email = ?";

    db.query(sql, [emailReq], (erro, resultado) => {
        if (erro) {
            console.error("Erro no MySQL:", erro);
            return res.status(500).json({ erro: "Erro no servidor" });
        }

        if (resultado.length > 0) {
            res.json(resultado[0]);
        } else {
            res.status(404).json({ erro: "Utilizador não encontrado" });
        }
    });
});

// ROTA: Buscar Máquinas Filtradas por Empresa
app.get("/api/maquinas", (req, res) => {
    const empresaUsuario = req.query.empresa;
    const todasMaquinas = lerMaquinas();

    // Filtra apenas se a empresa for válida (não seja undefined, null ou vazia)
    const maquinas = (empresaUsuario && empresaUsuario !== "undefined" && empresaUsuario !== "null")
        ? todasMaquinas.filter(m => m.empresa && m.empresa.toLowerCase() === empresaUsuario.toLowerCase())
        : todasMaquinas;

    const total = maquinas.length;
    let ativas = 0, operacao = 0, alertas = 0, eficienciaTotal = 0;

    maquinas.forEach(m => {
        if (m.status === "ativa") ativas++;
        if (m.operacao) operacao++;
        if (m.status === "ativa" && (m.alerta || m.temperatura >= 80)) alertas++;
        eficienciaTotal += m.eficiencia;
    });

    const mediaEficiencia = total > 0 ? Math.round(eficienciaTotal / total) : 0;

    res.json({
        maquinas,
        total,
        ativas,
        operacao,
        alertas,
        mediaEficiencia,
        nomeUser: "Usuário"
    });
});

// ROTA: Cadastrar / Atualizar Máquina
app.post("/api/maquinas", (req, res) => {
    const novaLeitura = req.body;

    if (!novaLeitura || !novaLeitura.nome) {
        return res.status(400).json({ erro: "Dados inválidos recebidos" });
    }

    let maquinas = lerMaquinas();
    const indice = maquinas.findIndex(m => m.nome === novaLeitura.nome);

    if (indice !== -1) {
        maquinas[indice] = { ...maquinas[indice], ...novaLeitura };
    } else {
        maquinas.push(novaLeitura);
    }

    fs.writeFile("./public/maquinas.json", JSON.stringify(maquinas, null, 4), (err) => {
        if (err) {
            console.error("Erro ao salvar no maquinas.json:", err);
            return res.status(500).json({ erro: "Erro ao salvar no arquivo" });
        }

        console.log(`✅ [POST] Dados da '${novaLeitura.nome}' atualizados com sucesso!`);
        res.json({
            sucesso: true,
            mensagem: "Dados da máquina salvos com sucesso!",
            dados: novaLeitura
        });
    });
});

// Inicialização do Servidor
app.listen(3000, () => {
    console.log("Servidor rodando! http://localhost:3000/");
});