/**
 * SCRIPT OPTIMIZADO PARA LIMPIAR DUPLICADOS
 * Versión rápida que no excede el tiempo de ejecución
 */

function limpiarDuplicadosRapido() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders_Data');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('ERROR: No se encontró la hoja Orders_Data');
    return;
  }
  
  Logger.log('=== LIMPIEZA RÁPIDA DE DUPLICADOS ===');
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('La hoja está vacía');
    return;
  }
  
  // Leer solo las columnas necesarias (order_id y todas las demás)
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  Logger.log(`Total de filas: ${lastRow}`);
  
  // Encontrar columna order_id
  const orderIdIndex = headers.indexOf('order_id');
  if (orderIdIndex === -1) {
    SpreadsheetApp.getUi().alert('ERROR: No se encontró la columna order_id');
    return;
  }
  
  // Usar Set para IDs únicos (más rápido)
  const seen = new Set();
  const uniqueRows = [headers];
  let duplicateCount = 0;
  
  for (let i = 1; i < data.length; i++) {
    const orderId = String(data[i][orderIdIndex]);
    
    if (!orderId || orderId === '') continue;
    
    if (!seen.has(orderId)) {
      seen.add(orderId);
      uniqueRows.push(data[i]);
    } else {
      duplicateCount++;
    }
  }
  
  const originalCount = lastRow - 1;
  const uniqueCount = uniqueRows.length - 1;
  
  Logger.log(`Filas originales: ${originalCount}`);
  Logger.log(`Filas únicas: ${uniqueCount}`);
  Logger.log(`Duplicados: ${duplicateCount}`);
  
  if (duplicateCount === 0) {
    SpreadsheetApp.getUi().alert(
      'Sin duplicados',
      'No se encontraron duplicados.\n\nLa hoja está limpia.',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    return;
  }
  
  // Confirmar
  const response = SpreadsheetApp.getUi().alert(
    'Duplicados encontrados',
    `Se encontraron ${duplicateCount} filas duplicadas.\n\n` +
    `Filas originales: ${originalCount}\n` +
    `Filas únicas: ${uniqueCount}\n\n` +
    `¿Deseas eliminar los duplicados?`,
    SpreadsheetApp.getUi().ButtonSet.YES_NO
  );
  
  if (response !== SpreadsheetApp.getUi().Button.YES) {
    Logger.log('Operación cancelada');
    return;
  }
  
  // Limpiar y escribir
  sheet.clear();
  sheet.getRange(1, 1, uniqueRows.length, headers.length).setValues(uniqueRows);
  
  Logger.log('✅ Limpieza completada');
  
  // Mostrar resumen de enero
  mostrarResumenEneroRapido(uniqueRows, headers);
  
  SpreadsheetApp.getUi().alert(
    'Limpieza completada ✅',
    `Se eliminaron ${duplicateCount} duplicados.\n\n` +
    `Filas finales: ${uniqueCount}\n\n` +
    `Revisa los logs para ver el resumen de enero 2025.`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function mostrarResumenEneroRapido(data, headers) {
  Logger.log('\n=== RESUMEN ENERO 2025 ===');
  
  const monthKeyIndex = headers.indexOf('month_key');
  const totalBagsIndex = headers.indexOf('total_bags');
  const totalKilosIndex = headers.indexOf('total_kilos');
  const totalPriceIndex = headers.indexOf('total_price');
  
  if (monthKeyIndex === -1 || totalBagsIndex === -1 || totalKilosIndex === -1 || totalPriceIndex === -1) {
    Logger.log('ERROR: Columnas no encontradas');
    return;
  }
  
  let orders = 0;
  let bags = 0;
  let kilos = 0;
  let revenue = 0;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][monthKeyIndex] === '2025-01') {
      orders++;
      bags += parseFloat(data[i][totalBagsIndex] || 0);
      kilos += parseFloat(data[i][totalKilosIndex] || 0);
      revenue += parseFloat(data[i][totalPriceIndex] || 0);
    }
  }
  
  Logger.log(`Órdenes: ${orders}`);
  Logger.log(`Bolsas: ${bags.toFixed(0)}`);
  Logger.log(`Kilos: ${kilos.toFixed(0)}`);
  Logger.log(`Ventas: $${revenue.toFixed(2)}`);
  Logger.log(`Precio/kg: $${(revenue / kilos).toFixed(2)}`);
  
  Logger.log('\n📊 DATOS ESPERADOS:');
  Logger.log('Órdenes: 105');
  Logger.log('Bolsas: 105');
  Logger.log('Kilos: 1,826');
  Logger.log('Ventas: $63,643.00');
  
  const diffBags = ((bags - 105) / 105 * 100).toFixed(1);
  const diffKilos = ((kilos - 1826) / 1826 * 100).toFixed(1);
  const diffRevenue = ((revenue - 63643) / 63643 * 100).toFixed(1);
  
  Logger.log('\n📈 DIFERENCIAS:');
  Logger.log(`Bolsas: ${diffBags}%`);
  Logger.log(`Kilos: ${diffKilos}%`);
  Logger.log(`Ventas: ${diffRevenue}%`);
}

function contarDuplicadosRapido() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Orders_Data');
  
  if (!sheet) {
    SpreadsheetApp.getUi().alert('ERROR: No se encontró Orders_Data');
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const orderIdIndex = headers.indexOf('order_id');
  
  if (orderIdIndex === -1) {
    SpreadsheetApp.getUi().alert('ERROR: No se encontró order_id');
    return;
  }
  
  const seen = new Set();
  let duplicates = 0;
  
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][orderIdIndex]);
    if (id && id !== '') {
      if (seen.has(id)) {
        duplicates++;
      } else {
        seen.add(id);
      }
    }
  }
  
  const total = data.length - 1;
  const unique = seen.size;
  
  Logger.log(`Total: ${total}, Únicos: ${unique}, Duplicados: ${duplicates}`);
  
  SpreadsheetApp.getUi().alert(
    'Análisis completado',
    `Total de filas: ${total}\n` +
    `IDs únicos: ${unique}\n` +
    `Duplicados: ${duplicates}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🧹 Limpieza Rápida')
    .addItem('🔍 Contar duplicados', 'contarDuplicadosRapido')
    .addItem('🧹 Limpiar duplicados', 'limpiarDuplicadosRapido')
    .addToUi();
}
