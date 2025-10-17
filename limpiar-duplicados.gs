/**
 * ========================================
 * SCRIPT PARA LIMPIAR DUPLICADOS EN GOOGLE SHEETS
 * Elimina filas duplicadas basándose en order_id
 * ========================================
 */

function limpiarDuplicadosOrders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders_Data');
  
  if (!sheet) {
    Logger.log('ERROR: No se encontró la hoja Orders_Data');
    return;
  }
  
  Logger.log('=== INICIANDO LIMPIEZA DE DUPLICADOS ===');
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('La hoja está vacía o solo tiene headers');
    return;
  }
  
  // Leer todos los datos
  const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
  const headers = data[0];
  
  Logger.log(`Total de filas (incluyendo header): ${lastRow}`);
  Logger.log(`Headers: ${headers.join(', ')}`);
  
  // Encontrar el índice de order_id (debería ser columna 0)
  const orderIdIndex = headers.indexOf('order_id');
  if (orderIdIndex === -1) {
    Logger.log('ERROR: No se encontró la columna order_id');
    return;
  }
  
  Logger.log(`Columna order_id encontrada en índice: ${orderIdIndex}`);
  
  // Crear mapa de IDs únicos
  const uniqueIds = new Set();
  const uniqueRows = [headers]; // Empezar con headers
  const duplicateIds = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const orderId = String(row[orderIdIndex]);
    
    if (!orderId || orderId === '') {
      Logger.log(`ADVERTENCIA: Fila ${i + 1} sin order_id, se omite`);
      continue;
    }
    
    if (uniqueIds.has(orderId)) {
      // Es un duplicado
      duplicateIds.push(orderId);
      Logger.log(`Duplicado encontrado: order_id=${orderId} en fila ${i + 1}`);
    } else {
      // Es único
      uniqueIds.add(orderId);
      uniqueRows.push(row);
    }
  }
  
  Logger.log(`\n=== RESUMEN ===`);
  Logger.log(`Filas originales (sin header): ${lastRow - 1}`);
  Logger.log(`Filas únicas: ${uniqueRows.length - 1}`);
  Logger.log(`Duplicados removidos: ${duplicateIds.length}`);
  
  if (duplicateIds.length === 0) {
    Logger.log('✅ No se encontraron duplicados. La hoja está limpia.');
    SpreadsheetApp.getUi().alert(
      'Sin duplicados',
      'No se encontraron duplicados en Orders_Data.\n\nLa hoja está limpia.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // Mostrar IDs duplicados únicos
  const uniqueDuplicateIds = [...new Set(duplicateIds)];
  Logger.log(`\nIDs duplicados (únicos): ${uniqueDuplicateIds.length}`);
  Logger.log(uniqueDuplicateIds.slice(0, 10).join(', ') + (uniqueDuplicateIds.length > 10 ? '...' : ''));
  
  // Preguntar al usuario si desea continuar
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'Duplicados encontrados',
    `Se encontraron ${duplicateIds.length} filas duplicadas.\n\n` +
    `Filas originales: ${lastRow - 1}\n` +
    `Filas únicas: ${uniqueRows.length - 1}\n\n` +
    `¿Deseas eliminar los duplicados?`,
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    Logger.log('Operación cancelada por el usuario');
    return;
  }
  
  // Limpiar la hoja y escribir solo datos únicos
  Logger.log('\nLimpiando hoja y escribiendo datos únicos...');
  sheet.clear();
  sheet.getRange(1, 1, uniqueRows.length, headers.length).setValues(uniqueRows);
  
  Logger.log('✅ Limpieza completada exitosamente');
  
  // Mostrar resumen de enero 2025
  mostrarResumenEnero(uniqueRows, headers);
  
  ui.alert(
    'Limpieza completada ✅',
    `Se eliminaron ${duplicateIds.length} filas duplicadas.\n\n` +
    `Filas finales: ${uniqueRows.length - 1}\n\n` +
    `Revisa los logs para ver el resumen de enero 2025.`,
    ui.ButtonSet.OK
  );
}

function mostrarResumenEnero(data, headers) {
  Logger.log('\n=== RESUMEN ENERO 2025 ===');
  
  const monthKeyIndex = headers.indexOf('month_key');
  const totalBagsIndex = headers.indexOf('total_bags');
  const totalKilosIndex = headers.indexOf('total_kilos');
  const totalPriceIndex = headers.indexOf('total_price');
  
  if (monthKeyIndex === -1 || totalBagsIndex === -1 || totalKilosIndex === -1 || totalPriceIndex === -1) {
    Logger.log('ERROR: No se encontraron todas las columnas necesarias');
    return;
  }
  
  let enero2025Orders = 0;
  let enero2025Bags = 0;
  let enero2025Kilos = 0;
  let enero2025Revenue = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const monthKey = row[monthKeyIndex];
    
    if (monthKey === '2025-01') {
      enero2025Orders++;
      enero2025Bags += parseFloat(row[totalBagsIndex] || 0);
      enero2025Kilos += parseFloat(row[totalKilosIndex] || 0);
      enero2025Revenue += parseFloat(row[totalPriceIndex] || 0);
    }
  }
  
  Logger.log(`Órdenes: ${enero2025Orders}`);
  Logger.log(`Bolsas: ${enero2025Bags.toFixed(0)}`);
  Logger.log(`Kilos: ${enero2025Kilos.toFixed(0)}`);
  Logger.log(`Ventas: $${enero2025Revenue.toFixed(2)}`);
  Logger.log(`Precio/kg: $${(enero2025Revenue / enero2025Kilos).toFixed(2)}`);
  
  Logger.log('\n📊 DATOS ESPERADOS:');
  Logger.log('Bolsas: 105');
  Logger.log('Kilos: 1,826');
  Logger.log('Ventas: $63,643.00');
  Logger.log('Precio/kg: $37.32');
  
  const diffBags = ((enero2025Bags - 105) / 105 * 100).toFixed(1);
  const diffKilos = ((enero2025Kilos - 1826) / 1826 * 100).toFixed(1);
  const diffRevenue = ((enero2025Revenue - 63643) / 63643 * 100).toFixed(1);
  
  Logger.log('\n📈 DIFERENCIAS:');
  Logger.log(`Bolsas: ${diffBags}%`);
  Logger.log(`Kilos: ${diffKilos}%`);
  Logger.log(`Ventas: ${diffRevenue}%`);
}

function analizarDuplicadosSinEliminar() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders_Data');
  
  if (!sheet) {
    Logger.log('ERROR: No se encontró la hoja Orders_Data');
    return;
  }
  
  Logger.log('=== ANÁLISIS DE DUPLICADOS (SIN ELIMINAR) ===');
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('La hoja está vacía o solo tiene headers');
    return;
  }
  
  const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
  const headers = data[0];
  const orderIdIndex = headers.indexOf('order_id');
  
  if (orderIdIndex === -1) {
    Logger.log('ERROR: No se encontró la columna order_id');
    return;
  }
  
  // Contar ocurrencias de cada ID
  const idCounts = new Map();
  
  for (let i = 1; i < data.length; i++) {
    const orderId = String(data[i][orderIdIndex]);
    if (orderId && orderId !== '') {
      idCounts.set(orderId, (idCounts.get(orderId) || 0) + 1);
    }
  }
  
  // Encontrar duplicados
  const duplicates = [];
  for (const [id, count] of idCounts.entries()) {
    if (count > 1) {
      duplicates.push({ id, count });
    }
  }
  
  Logger.log(`\nTotal de IDs únicos: ${idCounts.size}`);
  Logger.log(`IDs duplicados: ${duplicates.length}`);
  Logger.log(`Total de filas duplicadas: ${duplicates.reduce((sum, d) => sum + (d.count - 1), 0)}`);
  
  if (duplicates.length > 0) {
    Logger.log('\nPrimeros 20 IDs duplicados:');
    duplicates.slice(0, 20).forEach(d => {
      Logger.log(`  order_id=${d.id} aparece ${d.count} veces`);
    });
  }
  
  // Mostrar resumen por mes
  const monthKeyIndex = headers.indexOf('month_key');
  if (monthKeyIndex !== -1) {
    const monthCounts = new Map();
    for (let i = 1; i < data.length; i++) {
      const monthKey = data[i][monthKeyIndex];
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
    }
    
    Logger.log('\nÓrdenes por mes:');
    for (const [month, count] of [...monthCounts.entries()].sort()) {
      Logger.log(`  ${month}: ${count} órdenes`);
    }
  }
  
  SpreadsheetApp.getUi().alert(
    'Análisis completado',
    `Total de filas: ${lastRow - 1}\n` +
    `IDs únicos: ${idCounts.size}\n` +
    `IDs duplicados: ${duplicates.length}\n` +
    `Filas duplicadas: ${duplicates.reduce((sum, d) => sum + (d.count - 1), 0)}\n\n` +
    `Revisa los logs para más detalles.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🧹 Limpieza de Datos')
    .addItem('🔍 Analizar duplicados (sin eliminar)', 'analizarDuplicadosSinEliminar')
    .addItem('🧹 Limpiar duplicados', 'limpiarDuplicadosOrders')
    .addSeparator()
    .addItem('📊 Ver resumen enero 2025', 'verResumenEnero')
    .addToUi();
}

function verResumenEnero() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders_Data');
  
  if (!sheet) {
    Logger.log('ERROR: No se encontró la hoja Orders_Data');
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    Logger.log('La hoja está vacía');
    return;
  }
  
  const data = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
  const headers = data[0];
  
  mostrarResumenEnero(data, headers);
  
  SpreadsheetApp.getUi().alert(
    'Resumen generado',
    'Revisa los logs (Ver > Registros de ejecución) para ver el resumen detallado de enero 2025.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
