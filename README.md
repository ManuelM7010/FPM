# 🌟 Aurea Financial Intelligence • Plataforma de Planificación y Simulación Financiera

Aurea es un sistema cognitivo de planificación, simulación y forecast financiero personal impulsado por Inteligencia Artificial (Gemini 3.5-Flash). Combina paneles interactivos de Business Intelligence, calendarios automatizados de flujo de caja diario, simulación de escenarios ("What-if") y un asistente de análisis con conocimiento integral del estado patrimonial del usuario.

---

## 🛠️ Arquitectura de la Solución

La plataforma sigue una arquitectura **Full-Stack de un solo contenedor** optimizada para el menor consumo y despliegues instantáneos de alta confiabilidad en **Render.com** o **AWS**:

1. **Frontend (React + Vite + TypeScript + Recharts)**: 
   - Interfaz ultra-pulida de diseño **Sophisticated Dark** inspirada en Stripe Dashboard y Notion.
   - Motor de persistencia duradera en `localStorage` del cliente.
   - Parsers de hojas de cálculo unificados con mapeo dinámico de columnas (vía `xlsx`).

2. **Backend (Node.js + Express + ESM + TSX)**:
   - Servidor proxy Express seguro en puerto `3000` (puerto obligatorio de Sandbox e infraestructura).
   - Middleware de servicios web expuestos en `/api/classify` (clasificación inteligente), `/api/narrative` (estrategia narrativa en Markdown) y `/api/chat` (asistente cognoscitivo conversacional).
   - Integrado de forma segura con el SDK oficial de última generación `@google/genai`.

---

## 🗄️ Modelo de Datos y Script de Base de Datos (PostgreSQL + Prisma)

Si vas a escalar la solución para soporte multiusuario con base de datos duradera, utiliza este esquema entidad-relación y código SQL nativo para levantar tu base de datos relacional.

### Diagrama Entidad-Relación Conceptual
```
  [UserProfile] 1 ------ * [Transaction]
        1 | ------------ * [Installment]
        1 | ------------ * [RecurringExpense]
        1 | ------------ * [FinancialGoal]
```

### Script de Creación SQL (PostgreSQL compatible con Render DB)

```sql
-- Creación de la base de datos de Planificación Aurea
CREATE TABLE "UserProfile" (
    "id" VARCHAR(255) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "currency" VARCHAR(10) DEFAULT '$',
    "salary" DOUBLE PRECISION NOT NULL,
    "paymentFrequency" VARCHAR(50) NOT NULL,
    "savingsGoalPct" INT DEFAULT 20,
    "desiredEmergencyFundMonths" INT DEFAULT 6,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Transaction" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "date" DATE NOT NULL,
    "description" VARCHAR(255) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "type" VARCHAR(20) NOT NULL CHECK ("type" IN ('ingreso', 'gasto')),
    "account" VARCHAR(150),
    "comments" TEXT,
    "isRecurring" BOOLEAN DEFAULT FALSE,
    "recurrenceType" VARCHAR(100)
);

CREATE TABLE "Installment" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "totalInstallments" INT NOT NULL,
    "paidInstallments" INT DEFAULT 0,
    "paymentDay" INT NOT NULL,
    "cardAssociated" VARCHAR(150)
);

CREATE TABLE "RecurringExpense" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" VARCHAR(50) NOT NULL,
    "startDate" DATE NOT NULL,
    "paymentDay" INT NOT NULL
);

CREATE TABLE "FinancialGoal" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userId" VARCHAR(255) REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION DEFAULT 0,
    "category" VARCHAR(100) NOT NULL,
    "targetDate" DATE NOT NULL
);
```

---

## 🚀 Parámetros y Pasos de Configuración para Render.com

Sigue estos sencillos pasos para tener tu app arriba en 5 minutos:

### Paso 1: Sube la aplicación a tu cuenta de GitHub
1. Crea un repositorio vacío en GitHub llamado `aurea-financial-intelligence`.
2. Inicializa git localmente y haz tu primer push:
   ```bash
   git init
   git add .
   git commit -m "feat: base unificada de aurea intelligence lista para Render"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/aurea-financial-intelligence.git
   git push -u origin main
   ```

### Paso 2: Crea un Web Service en Render
1. Inicia sesión en **[dashboard.render.com](https://dashboard.render.com)**.
2. Haz clic en **New +** y selecciona **Web Service**.
3. Conéctate a tu repositorio de GitHub `aurea-financial-intelligence`.

### Paso 3: Configura las variables y comandos de renderizado
Llena los campos solicitados con los siguientes parámetros:

| Parámetro | Valor de Configuración |
| :--- | :--- |
| **Name** | `aurea-financial-intelligence` |
| **Root Directory** | *(Dejar vacío para usar la raíz del proyecto* `.`*)* |
| **Runtime** | `Node` |
| **Region** | Sólido (e.g., `Oregon` o `Frankfurt`) |
| **Branch** | `main` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` (ejecuta de forma ultra-rápida `node dist/server.cjs`) |

### Paso 4: Carga las Variables de Entorno (Environment Variables)
En la sección **Secret Files / Environment Variables** de Render, añade lo siguiente:

*   `GEMINI_API_KEY`: Tu clave de Google AI Studio / Gemini API.
*   `NODE_ENV`: `production`
*   `NODE_VERSION`: `20.11.0` *(CRÍTICO: Obliga a Render a usar una versión moderna de Node.js, previniendo fallos al compilar o arrancar).*

---

## 🧠 Algoritmos Clave Incluidos

1. **Clasificador Heurístico e Inteligente (Vía `/api/classify`)**:
   - Detecta de forma inteligente deudas, alquiler, suscripciones (unificando Netflix, Spotify, etc.) devolviendo un contrato estructurado en JSON listo para poblar presupuestos.

2. **Forecast Compound Cashflow**:
   - Algoritmo que no solo proyecta la tendencia, sino que superpone fechas exactas y plazos amortizables de deudas recurrentes en el calendario de balance diario.

3. **Simulador Conversacional**:
   - Recalcula el nivel de deuda y run-rate en días basándose en modificaciones "qué pasa si", permitiendo ver a cuántos días se reduce tu amortización gracias a la IA de Gemini.
