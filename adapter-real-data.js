// ═══════════════════════════════════════════════════════════════════════════════════
// 🔧 ADAPTADOR DE DATOS REALES - Mapea campos exactos del script kmita al Dashboard
// ═══════════════════════════════════════════════════════════════════════════════════
// 
// ESTRUCTURA DEL SCRIPT KMITA:
// 
// Orders_Data (24 campos):
//   order_id, order_name, order_number, created_at, processed_at, month_key,
//   financial_status, fulfillment_status, currency, total_price, subtotal_price,
//   total_tax, total_discounts, total_bags, total_kilos, customer_id, customer_email,
//   customer_first_name, customer_last_name, shipping_city, shipping_province,
//   shipping_country, line_items_count, product_titles
//
// Customers_Data (17 campos):
//   customer_id, email, first_name, last_name, orders_count, total_spent,
//   created_at, updated_at, days_since_creation, days_since_last_order,
//   accepts_marketing, state, currency, customer_segment, address_city,
//   address_province, address_country
//
// ═══════════════════════════════════════════════════════════════════════════════════

(function() {
    console.log('🔧 [ADAPTER] Cargando adaptador de datos reales (kmita)...');

    // Mapeo de campos: Google Sheets (kmita) → Dashboard
    const FIELD_MAPPING = {
        orders: {
            // Campos directos del script kmita
            'order_id': 'order_id',
            'order_name': 'order_name',
            'order_number': 'order_number',
            'created_at': 'created_at',
            'processed_at': 'processed_at',
            'month_key': 'month_key',
            'financial_status': 'financial_status',
            'fulfillment_status': 'fulfillment_status',
            'currency': 'currency',
            'total_price': 'total_price',
            'subtotal_price': 'subtotal_price',
            'total_tax': 'total_tax',
            'total_discounts': 'total_discounts',
            'total_bags': 'total_bags',
            'total_kilos': 'total_kilos',
            'customer_id': 'customer_id',
            'customer_email': 'customer_email',
            'customer_first_name': 'customer_first_name',
            'customer_last_name': 'customer_last_name',
            'shipping_city': 'shipping_city',
            'shipping_province': 'shipping_province',
            'shipping_country': 'shipping_country',
            'line_items_count': 'line_items_count',
            'product_titles': 'product_titles',
            
            // CAMPOS CALCULADOS para el dashboard
            'payment_method': function(order) {
                // Calcular método de pago desde financial_status
                const status = (order.financial_status || '').toLowerCase();
                if (status === 'paid') return 'Pagado';
                if (status === 'pending') return 'Pendiente';
                if (status === 'refunded') return 'Reembolsado';
                if (status === 'partially_refunded') return 'Parcialmente Reembolsado';
                if (status === 'authorized') return 'Autorizado';
                return 'No especificado';
            },
            
            'fulfillment_days': function(order) {
                // Calcular días entre created_at y processed_at
                if (!order.created_at || !order.processed_at) {
                    return 0;
                }
                
                try {
                    const created = new Date(order.created_at);
                    const processed = new Date(order.processed_at);
                    
                    if (isNaN(created.getTime()) || isNaN(processed.getTime())) {
                        return 0;
                    }
                    
                    const diffTime = Math.abs(processed - created);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    return diffDays >= 0 ? diffDays : 0;
                } catch (e) {
                    console.warn('[ADAPTER] Error calculando fulfillment_days:', e);
                    return 0;
                }
            },
            
            'customer_segment': function(order) {
                // Segmentación básica por monto de la orden
                const total = parseFloat(order.total_price) || 0;
                if (total > 1000) return 'VIP';
                if (total > 500) return 'Frecuente';
                if (total > 100) return 'Regular';
                return 'Nuevo';
            }
        },
        
        customers: {
            // Campos directos del script kmita
            'customer_id': 'customer_id',
            'email': 'email',
            'first_name': 'first_name',
            'last_name': 'last_name',
            'orders_count': 'orders_count',
            'total_spent': 'total_spent',
            'created_at': 'created_at',
            'updated_at': 'updated_at',
            'days_since_creation': 'days_since_creation',
            'days_since_last_order': 'days_since_last_order',
            'accepts_marketing': 'accepts_marketing',
            'state': 'state',
            'currency': 'currency',
            'customer_segment': 'customer_segment', // Ya viene calculado del script (New, One-time, Repeat, Loyal)
            'address_city': 'address_city',
            'address_province': 'address_province',
            'address_country': 'address_country'
        }
    };

    // Función para adaptar una orden
    function adaptOrder(rawOrder) {
        const adapted = {};
        
        Object.keys(FIELD_MAPPING.orders).forEach(dashboardField => {
            const mapping = FIELD_MAPPING.orders[dashboardField];
            
            if (typeof mapping === 'function') {
                // Campo calculado
                adapted[dashboardField] = mapping(rawOrder);
            } else {
                // Campo directo
                adapted[dashboardField] = rawOrder[mapping];
            }
        });
        
        // Asegurar que los campos numéricos sean números
        if (adapted.total_price) adapted.total_price = parseFloat(adapted.total_price) || 0;
        if (adapted.subtotal_price) adapted.subtotal_price = parseFloat(adapted.subtotal_price) || 0;
        if (adapted.total_tax) adapted.total_tax = parseFloat(adapted.total_tax) || 0;
        if (adapted.total_discounts) adapted.total_discounts = parseFloat(adapted.total_discounts) || 0;
        if (adapted.total_bags) adapted.total_bags = parseInt(adapted.total_bags) || 0;
        if (adapted.total_kilos) adapted.total_kilos = parseFloat(adapted.total_kilos) || 0;
        if (adapted.line_items_count) adapted.line_items_count = parseInt(adapted.line_items_count) || 0;
        
        return adapted;
    }

    // Función para adaptar un cliente
    function adaptCustomer(rawCustomer) {
        const adapted = {};
        
        Object.keys(FIELD_MAPPING.customers).forEach(dashboardField => {
            const mapping = FIELD_MAPPING.customers[dashboardField];
            adapted[dashboardField] = rawCustomer[mapping];
        });
        
        // Asegurar que los campos numéricos sean números
        if (adapted.orders_count) adapted.orders_count = parseInt(adapted.orders_count) || 0;
        if (adapted.total_spent) adapted.total_spent = parseFloat(adapted.total_spent) || 0;
        if (adapted.days_since_creation) adapted.days_since_creation = parseInt(adapted.days_since_creation) || 0;
        if (adapted.days_since_last_order) adapted.days_since_last_order = parseInt(adapted.days_since_last_order) || 0;
        
        // El customer_segment ya viene calculado del script kmita (New, One-time, Repeat, Loyal)
        // Mapear a los nombres en español del dashboard
        if (adapted.customer_segment) {
            const segmentMap = {
                'New': 'Nuevo',
                'One-time': 'Una vez',
                'Repeat': 'Repetidor',
                'Loyal': 'Leal'
            };
            adapted.customer_segment = segmentMap[adapted.customer_segment] || adapted.customer_segment;
        }
        
        return adapted;
    }

    // Función para adaptar array de órdenes
    function adaptOrders(rawOrders) {
        console.log(`🔧 [ADAPTER] Adaptando ${rawOrders.length} órdenes desde kmita...`);
        const adapted = rawOrders.map(adaptOrder);
        
        // Verificar campos calculados
        const withPayment = adapted.filter(o => o.payment_method && o.payment_method !== 'No especificado').length;
        const withFulfillment = adapted.filter(o => o.fulfillment_days > 0).length;
        const withSegment = adapted.filter(o => o.customer_segment).length;
        
        console.log(`✅ [ADAPTER] Órdenes adaptadas: ${adapted.length}`);
        console.log(`📊 [ADAPTER] Con método de pago: ${withPayment}/${adapted.length}`);
        console.log(`📦 [ADAPTER] Con fulfillment_days: ${withFulfillment}/${adapted.length}`);
        console.log(`👥 [ADAPTER] Con segmentación: ${withSegment}/${adapted.length}`);
        
        return adapted;
    }

    // Función para adaptar array de clientes
    function adaptCustomers(rawCustomers) {
        console.log(`🔧 [ADAPTER] Adaptando ${rawCustomers.length} clientes desde kmita...`);
        const adapted = rawCustomers.map(adaptCustomer);
        
        // Verificar segmentación
        const segments = {};
        adapted.forEach(c => {
            const seg = c.customer_segment || 'Sin segmento';
            segments[seg] = (segments[seg] || 0) + 1;
        });
        
        console.log(`✅ [ADAPTER] Clientes adaptados: ${adapted.length}`);
        console.log(`👥 [ADAPTER] Segmentación:`, segments);
        
        return adapted;
    }

    // Exportar funciones globalmente
    window.adaptOrders = adaptOrders;
    window.adaptCustomers = adaptCustomers;
    window.adaptOrder = adaptOrder;
    window.adaptCustomer = adaptCustomer;

    console.log('✅ [ADAPTER] Adaptador de datos reales (kmita) cargado correctamente');
    console.log('📋 [ADAPTER] Funciones disponibles: adaptOrders(), adaptCustomers()');
    console.log('📝 [ADAPTER] Estructura: 24 campos de órdenes + 17 campos de clientes');
})();
