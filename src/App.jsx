import { useState, useEffect } from 'react';

// Função auxiliar para formatar números sem casas decimais desnecessárias (Ex: 2 em vez de 2.0)
const formatNumber = (num) => {
  return parseFloat(num.toFixed(2)).toString();
};

function App() {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      name: "Massa de Panqueca Base",
      originalYield: 4,
      ingredients: [
        { name: "Farinha de Trigo", baseQty: 300, baseUnit: "g", textQty: 2.5, textUnit: "xícara(s)" },
        { name: "Leite", baseQty: 360, baseUnit: "ml", textQty: 1.5, textUnit: "xícara(s)" },
        { name: "Ovos", baseQty: 100, baseUnit: "g", textQty: 2, textUnit: "unidade(s)" },
        { name: "Sal", baseQty: 2, baseUnit: "g", textQty: 1, textUnit: "colher(es) de café" }
      ],
      instructions: [
        "No liquidificador, adicione os ovos, o leite, o sal e bata por 1 minuto.",
        "Acrescente a farinha de trigo aos poucos, mantendo o liquidificador em velocidade baixa.",
        "Bata por mais 2 minutos até obter uma massa lisa.",
        "Aqueça uma frigideira antiaderente em fogo médio e unte levemente.",
        "Despeje uma concha de massa e espalhe uniformemente pelo fundo.",
        "Deixe dourar até as bordas soltarem, vire e doure o outro lado."
      ]
    },
    {
      id: 2,
      name: "Bolo de Caneca Rápido",
      originalYield: 1,
      ingredients: [
        { name: "Farinha de Trigo", baseQty: 60, baseUnit: "g", textQty: 4, textUnit: "colher(es) de sopa" },
        { name: "Açúcar", baseQty: 40, baseUnit: "g", textQty: 3, textUnit: "colher(es) de sopa" },
        { name: "Leite", baseQty: 60, baseUnit: "ml", textQty: 4, textUnit: "colher(es) de sopa" },
        { name: "Fermento em Pó", baseQty: 5, baseUnit: "g", textQty: 1, textUnit: "colher(es) de chá" }
      ],
      instructions: [
        "Em uma caneca, misture a farinha, o açúcar e o fermento em pó.",
        "Adicione o leite e mexa bem com um garfo até ficar homogêneo.",
        "Leve ao micro-ondas em potência alta por exatamente 3 minutos.",
        "Aguarde esfriar levemente antes de consumir."
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeRecipe, setActiveRecipe] = useState(recipes[0]);
  const [displayMode, setDisplayMode] = useState('peso'); 
  const [scale, setScale] = useState(1); 
  const [editing, setEditing] = useState(null); 

  const [formName, setFormName] = useState('');
  const [formYield, setFormYield] = useState('');
  const [formIngredients, setFormIngredients] = useState(''); 
  const [formInstructions, setFormInstructions] = useState('');

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRecipe = (e) => {
    e.preventDefault();
    if (!formName || !formYield || !formIngredients) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const parsedIngredients = formIngredients.split('\n').map(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const name = parts[0].trim();
        
        const weightMatch = parts[1].trim().match(/^([0-9.]+)\s*(.*)$/);
        const baseQty = weightMatch ? Number(weightMatch[1]) : 100;
        const baseUnit = (weightMatch && weightMatch[2].trim()) || "g";

        const measureMatch = parts[2].trim().match(/^([0-9.]+)\s*(.*)$/);
        const textQty = measureMatch ? Number(measureMatch[1]) : 1;
        const textUnit = (measureMatch && measureMatch[2].trim()) || "unidade(s)";

        return { name, baseQty, baseUnit, textQty, textUnit };
      }
      return null;
    }).filter(Boolean); 

    if (parsedIngredients.length === 0) {
      alert("Formato dos ingredientes incorreto. Use: Nome, Peso, Medida");
      return;
    }

    const newRecipe = {
      id: Date.now(), // ID dinâmico baseado em timestamp (melhor prática que usar length + 1)
      name: formName,
      originalYield: Number(formYield),
      ingredients: parsedIngredients,
      instructions: formInstructions.split('\n').filter(line => line.trim() !== '')
    };

    setRecipes([...recipes, newRecipe]);
    setActiveRecipe(newRecipe);
    setScale(1);
    setEditing(null);

    setFormName('');
    setFormYield('');
    setFormIngredients('');
    setFormInstructions('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="Buscar receita..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {filteredRecipes.map(recipe => (
          <button
            key={recipe.id}
            onClick={() => {
              setActiveRecipe(recipe);
              setScale(1);
              setEditing(null);
            }}
            style={{
              padding: '8px 12px',
              backgroundColor: activeRecipe.id === recipe.id ? '#007bff' : '#f0f0f0',
              color: activeRecipe.id === recipe.id ? 'white' : 'black',
              border: '1px solid #ccc',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {recipe.name}
          </button>
        ))}
      </div>

      <main style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
        <h2>{activeRecipe.name}</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => {
              setDisplayMode('peso');
              setEditing(null); 
            }} 
            style={{ padding: '10px', backgroundColor: displayMode === 'peso' ? '#007bff' : '#ccc', color: 'white', border: 'none', borderRadius: '4px 0 0 4px', cursor: 'pointer' }}
          >
            ⚖️ Modo Padrão (g/ml)
          </button>
          <button 
            onClick={() => {
              setDisplayMode('medida');
              setEditing(null); 
            }} 
            style={{ padding: '10px', backgroundColor: displayMode === 'medida' ? '#28a745' : '#ccc', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}
          >
            🥣 Medidas Caseiras
          </button>
        </div>

        <p style={{ fontSize: '16px', color: '#333' }}>
          <strong>Rendimento:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>{formatNumber(activeRecipe.originalYield * scale)}</span> porções
        </p>

        <h3>Ingredientes</h3>
        <ul>
          {activeRecipe.ingredients.map((ing) => {
            const baseValue = displayMode === 'peso' ? ing.baseQty : ing.textQty;
            const unitLabel = displayMode === 'peso' ? ing.baseUnit : ing.textUnit;
            
            const isEditingThis = editing && editing.name === ing.name;
            const displayValue = isEditingThis ? editing.value : formatNumber(baseValue * scale);

            return (
              <li key={ing.name} style={{ marginBottom: '12px', listStyle: 'none' }}>
                <strong>{ing.name}: </strong>
                <input 
                  type="number" 
                  step="0.1"
                  value={displayValue} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditing({ name: ing.name, value: val });
                    
                    if (val !== '') {
                      const num = Number(val);
                      if (baseValue > 0) setScale(num / baseValue);
                    }
                  }}
                  onBlur={() => setEditing(null)}
                  style={{ width: '70px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <span> {unitLabel}</span>
              </li>
            );
          })}
        </ul>

        <h3>Modo de Preparo</h3>
        <ol style={{ paddingLeft: '20px' }}>
          {activeRecipe.instructions.map((step, i) => (
            <li key={i} style={{ marginBottom: '8px', lineHeight: '1.4' }}>{step}</li>
          ))}
        </ol>
      </main>

      <hr style={{ margin: '40px 0' }} />
      
      <div style={{ backgroundColor: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
        <h3>Novo Cadastro</h3>
        <form onSubmit={handleCreateRecipe}>
          <div style={{ marginBottom: '10px' }}>
            <label>Nome da Receita:</label>
            <input type="text" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="Ex: Bolo de Fubá" />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Rendimento Base (Porções):</label>
            <input type="number" value={formYield} onChange={e => setFormYield(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="Ex: 6" />
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Ingredientes (Formato: Nome, Peso, Medida Caseira):</label>
            <textarea 
              value={formIngredients} 
              onChange={e => setFormIngredients(e.target.value)} 
              style={{ width: '100%', height: '80px', padding: '8px', marginTop: '5px', fontFamily: 'sans-serif', boxSizing: 'border-box' }} 
              placeholder="Açúcar, 150g, 1 xícara&#10;Sal, 2g, 1 colher de café" 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Instruções (Um passo por linha):</label>
            <textarea value={formInstructions} onChange={e => setFormInstructions(e.target.value)} style={{ width: '100%', height: '80px', padding: '8px', marginTop: '5px', fontFamily: 'sans-serif', boxSizing: 'border-box' }} placeholder="Passo 1&#10;Passo 2" />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#23272b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Salvar Receita</button>
        </form>
      </div>
    </div>
  );
}

export default App;