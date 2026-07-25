// KA Farm - Group Orders Storage Domain
// Manages community farms and group orders

import { KAStorage } from './core.js';

const DEFAULT_FARMS_COMMUNITY = [
  {
    id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    region: 'Niayes',
    contact_name: 'Moussa KA',
    contact_phone: '77 123 45 67',
    contact_email: 'moussa@kafarm.sn',
    location: 'Zone Maraîchère de Pout',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Ferme principale, leader du groupe'
  },
  {
    id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    region: 'Thiès',
    contact_name: 'Aly Diop',
    contact_phone: '76 456 78 90',
    contact_email: 'aly.diop@agri.sn',
    location: 'Keur Massar',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Spécialisée en cultures maraîchères'
  },
  {
    id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    region: 'Mbour',
    contact_name: 'Fatou Sow',
    contact_phone: '77 789 01 23',
    contact_email: 'fatou.sow@maraichage.sn',
    location: 'Somet',
    is_active: true,
    last_order_date: '2026-07-10',
    notes: 'Production intensive de tomates'
  },
  {
    id: 'FC-004',
    farm_name: 'Ferme Ndiaye - Kaolack',
    region: 'Kaolack',
    contact_name: 'Ibrahima Ndiaye',
    contact_phone: '70 123 45 67',
    contact_email: 'ibrahim.ndiaye@ferme.sn',
    location: 'Ndande',
    is_active: true,
    last_order_date: '2026-06-25',
    notes: 'Élevage et cultures associées'
  },
  {
    id: 'FC-005',
    farm_name: 'Ferme Ba - Dakar',
    region: 'Dakar',
    contact_name: 'Ousmane Ba',
    contact_phone: '76 543 21 09',
    contact_email: 'ousmane.ba@agri.sn',
    location: 'Sandika',
    is_active: true,
    last_order_date: '2026-07-05',
    notes: 'Commercialisation et logistique'
  },
  {
    id: 'FC-006',
    farm_name: 'Ferme Fall - Fatick',
    region: 'Fatick',
    contact_name: 'Modou Fall',
    contact_phone: '77 234 56 78',
    contact_email: 'modou.fall@maraichage.sn',
    location: 'Fimela',
    is_active: true,
    last_order_date: '2026-06-15',
    notes: 'Production diversifiée'
  }
];

const DEFAULT_GROUP_ORDERS = [
  {
    id: 'GO-001',
    group_name: 'Commande Groupée Niayes - Juillet',
    initiated_by: 'Moussa KA',
    supplier_id: 'SUP-001',
    supplier_name: 'Agro-Sénégal Fournisseur',
    status: 'En cours',
    total_amount_fcfa: 1500000,
    order_date: '2026-07-10',
    expected_delivery_date: '2026-07-20',
    delivery_address: 'Zone Maraîchère de Pout, Niayes',
    region: 'Niayes',
    notes: 'Commande d\'engrais et semences pour la saison d\'hivernage'
  },
  {
    id: 'GO-002',
    group_name: 'Commande Groupée Pesticides - Juin',
    initiated_by: 'Aly Diop',
    supplier_id: 'SUP-002',
    supplier_name: 'Phyto-Pro Sénégal',
    status: 'Livré',
    total_amount_fcfa: 850000,
    order_date: '2026-06-15',
    expected_delivery_date: '2026-06-25',
    delivery_address: 'Keur Massar, Thiès',
    region: 'Thiès',
    notes: 'Traitements phytosanitaires pour protection des cultures'
  },
  {
    id: 'GO-003',
    group_name: 'Commande Groupée Engrais Organique',
    initiated_by: 'Fatou Sow',
    supplier_id: 'SUP-003',
    supplier_name: 'Bio-Fertil Sénégal',
    status: 'Livré',
    total_amount_fcfa: 2200000,
    order_date: '2026-06-01',
    expected_delivery_date: '2026-06-10',
    delivery_address: 'Somet, Mbour',
    region: 'Mbour',
    notes: 'Compost et amendements organiques'
  }
];

const DEFAULT_GROUP_ORDER_ITEMS = [
  {
    id: 'GOI-001',
    group_order_id: 'GO-001',
    farm_id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    intrant_id: 'IN-001',
    intrant_name: 'Engrais NPK 15-15-15',
    quantity: 50,
    unit: 'sacs',
    unit_price: 12000,
    total_price: 600000,
    delivery_received: true,
    received_quantity: 50,
    notes: 'Pour culture de tomates'
  },
  {
    id: 'GOI-002',
    group_order_id: 'GO-001',
    farm_id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    intrant_id: 'IN-001',
    intrant_name: 'Engrais NPK 15-15-15',
    quantity: 30,
    unit: 'sacs',
    unit_price: 12000,
    total_price: 360000,
    delivery_received: true,
    received_quantity: 30,
    notes: 'Pour culture d\'oignons'
  },
  {
    id: 'GOI-003',
    group_order_id: 'GO-001',
    farm_id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    intrant_id: 'IN-002',
    intrant_name: 'Semences Tomate Mongal F1',
    quantity: 10,
    unit: 'sachets',
    unit_price: 35000,
    total_price: 350000,
    delivery_received: true,
    received_quantity: 10,
    notes: 'Semences hybrides'
  },
  {
    id: 'GOI-004',
    group_order_id: 'GO-002',
    farm_id: 'FC-001',
    farm_name: 'Fermes KA - Niayes',
    intrant_id: 'IN-003',
    intrant_name: 'Purin de Neem',
    quantity: 20,
    unit: 'litres',
    unit_price: 2500,
    total_price: 50000,
    delivery_received: true,
    received_quantity: 20,
    notes: 'Traitement bio contre les insectes'
  },
  {
    id: 'GOI-005',
    group_order_id: 'GO-002',
    farm_id: 'FC-002',
    farm_name: 'Ferme Diop - Thiès',
    intrant_id: 'IN-004',
    intrant_name: 'Fongicide Systémique',
    quantity: 15,
    unit: 'litres',
    unit_price: 4000,
    total_price: 60000,
    delivery_received: true,
    received_quantity: 15,
    notes: 'Protection contre le mildiou'
  },
  {
    id: 'GOI-006',
    group_order_id: 'GO-003',
    farm_id: 'FC-003',
    farm_name: 'Ferme Sow - Mbour',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 5,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 400000,
    delivery_received: true,
    received_quantity: 5,
    notes: 'Amendement du sol'
  },
  {
    id: 'GOI-007',
    group_order_id: 'GO-003',
    farm_id: 'FC-004',
    farm_name: 'Ferme Ndiaye - Kaolack',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 3,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 240000,
    delivery_received: true,
    received_quantity: 3,
    notes: 'Fertilisation des parcelles'
  },
  {
    id: 'GOI-008',
    group_order_id: 'GO-003',
    farm_id: 'FC-005',
    farm_name: 'Ferme Ba - Dakar',
    intrant_id: 'IN-005',
    intrant_name: 'Compost Organique',
    quantity: 2,
    unit: 'tonnes',
    unit_price: 80000,
    total_price: 160000,
    delivery_received: false,
    received_quantity: 0,
    notes: 'En attente de livraison'
  }
];

export const GroupOrdersStorage = {
  getFarmsCommunity() {
    return KAStorage.get('ka_farm_farms_community', DEFAULT_FARMS_COMMUNITY);
  },
  saveFarmsCommunity(farms) {
    KAStorage.set('ka_farm_farms_community', farms);
  },
  addFarmToCommunity(farm) {
    const farms = this.getFarmsCommunity();
    farms.push(farm);
    this.saveFarmsCommunity(farms);
    return farm;
  },
  updateFarmInCommunity(id, updates) {
    const farms = this.getFarmsCommunity();
    const index = farms.findIndex(f => f.id === id);
    if (index !== -1) {
      farms[index] = { ...farms[index], ...updates };
      this.saveFarmsCommunity(farms);
      return farms[index];
    }
    return null;
  },
  deleteFarmFromCommunity(id) {
    const farms = this.getFarmsCommunity();
    const filtered = farms.filter(f => f.id !== id);
    this.saveFarmsCommunity(filtered);
    return filtered;
  },
  getFarmById(id) {
    const farms = this.getFarmsCommunity();
    return farms.find(f => f.id === id);
  },
  getFarmsByRegion(region) {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.region === region);
  },
  getActiveFarms() {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.is_active);
  },
  getFarmsWithOrders() {
    const farms = this.getFarmsCommunity();
    return farms.filter(f => f.last_order_date);
  },
  getCommunityStats() {
    const farms = this.getFarmsCommunity();
    const total = farms.length;
    const active = farms.filter(f => f.is_active).length;
    const withOrders = farms.filter(f => f.last_order_date).length;
    return { total, active, withOrders };
  },

  getGroupOrders() {
    return KAStorage.get('ka_farm_group_orders', DEFAULT_GROUP_ORDERS);
  },
  saveGroupOrders(orders) {
    KAStorage.set('ka_farm_group_orders', orders);
  },
  addGroupOrder(order) {
    const orders = this.getGroupOrders();
    orders.push(order);
    this.saveGroupOrders(orders);
    return order;
  },
  updateGroupOrder(id, updates) {
    const orders = this.getGroupOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      this.saveGroupOrders(orders);
      return orders[index];
    }
    return null;
  },
  deleteGroupOrder(id) {
    const orders = this.getGroupOrders();
    const filtered = orders.filter(o => o.id !== id);
    this.saveGroupOrders(filtered);
    return filtered;
  },
  getGroupOrderById(id) {
    const orders = this.getGroupOrders();
    return orders.find(o => o.id === id);
  },
  getGroupOrdersByRegion(region) {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.region === region);
  },
  getGroupOrdersByStatus(status) {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.status === status);
  },
  getActiveGroupOrders() {
    const orders = this.getGroupOrders();
    return orders.filter(o => o.status === 'En cours' || o.status === 'Confirmée');
  },
  getGroupOrderStats() {
    const orders = this.getGroupOrders();
    const total = orders.length;
    const active = this.getActiveGroupOrders().length;
    const delivered = orders.filter(o => o.status === 'Livré').length;
    const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount_fcfa || 0), 0);
    return { total, active, delivered, totalAmount };
  },

  getGroupOrderItems() {
    return KAStorage.get('ka_farm_group_order_items', DEFAULT_GROUP_ORDER_ITEMS);
  },
  saveGroupOrderItems(items) {
    KAStorage.set('ka_farm_group_order_items', items);
  },
  addGroupOrderItem(item) {
    const items = this.getGroupOrderItems();
    items.push(item);
    this.saveGroupOrderItems(items);
    return item;
  },
  updateGroupOrderItem(id, updates) {
    const items = this.getGroupOrderItems();
    const index = items.findIndex(i => i.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      this.saveGroupOrderItems(items);
      return items[index];
    }
    return null;
  },
  deleteGroupOrderItem(id) {
    const items = this.getGroupOrderItems();
    const filtered = items.filter(i => i.id !== id);
    this.saveGroupOrderItems(filtered);
    return filtered;
  },
  getGroupOrderItemsByOrder(orderId) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.group_order_id === orderId);
  },
  getGroupOrderItemsByFarm(farmId) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.farm_id === farmId);
  },
  getGroupOrderItemsByStatus(orderId, delivered) {
    const items = this.getGroupOrderItems();
    return items.filter(i => i.group_order_id === orderId && i.delivery_received === delivered);
  },
  markItemAsReceived(itemId, quantity) {
    const items = this.getGroupOrderItems();
    const index = items.findIndex(i => i.id === itemId);
    if (index !== -1) {
      items[index] = {
        ...items[index],
        delivery_received: true,
        received_quantity: quantity || items[index].quantity,
        updated_at: new Date().toISOString()
      };
      this.saveGroupOrderItems(items);
      return items[index];
    }
    return null;
  }
};