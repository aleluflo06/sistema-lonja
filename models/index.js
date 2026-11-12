import Usuario from './Usuario.js';
import Tipo from './Tipo.js';
import Comprador from './Comprador.js';
import Lote from './Lote.js';
import Especie from './Especie.js';
import Compra from './Compra.js';

const R = 'RESTRICT';

// Lote 1 --- N Especie
Lote.hasMany(Especie, { foreignKey: 'id_lte', as: 'especies', onDelete: R });
Especie.belongsTo(Lote, { foreignKey: 'id_lte', as: 'lote', onDelete: R });
// Tipo 1 --- N Especie
Tipo.hasMany(Especie, { foreignKey: 'id_tpo', as: 'especies', onDelete: R });
Especie.belongsTo(Tipo, { foreignKey: 'id_tpo', as: 'tipo', onDelete: R });
// Lote 1 --- 1 Compra
Lote.hasOne(Compra, { foreignKey: 'id_cmp', as: 'compra', onDelete: R });
Compra.belongsTo(Lote, { foreignKey: 'id_cmp', as: 'lote', onDelete: R });
// Comprador 1 --- N Compra
Comprador.hasMany(Compra, { foreignKey: 'codigo_cpr', as: 'compras', onDelete: R });
Compra.belongsTo(Comprador, { foreignKey: 'codigo_cpr', as: 'comprador', onDelete: R });

export { Usuario, Tipo, Comprador, Lote, Especie, Compra };
