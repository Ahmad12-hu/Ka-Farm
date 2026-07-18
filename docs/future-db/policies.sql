-- KA Farm - Politiques de sécurité Supabase (Row Level Security)
-- Ces politiques permettent l'accès public en lecture/écriture pour le développement

-- Activer RLS sur toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE parcelles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurseries ENABLE ROW LEVEL SECURITY;
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheptel ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevage_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE elevage_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques pour users (lecture/écriture publique pour développement)
CREATE POLICY "Allow public read access to users" ON users
  FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to users" ON users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access to users" ON users
  FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access to users" ON users
  FOR DELETE USING (true);

-- Politiques pour parcelles
CREATE POLICY "Allow public access to parcelles" ON parcelles
  FOR ALL USING (true);

-- Politiques pour crops
CREATE POLICY "Allow public access to crops" ON crops
  FOR ALL USING (true);

-- Politiques pour nurseries
CREATE POLICY "Allow public access to nurseries" ON nurseries
  FOR ALL USING (true);

-- Politiques pour stocks
CREATE POLICY "Allow public access to stocks" ON stocks
  FOR ALL USING (true);

-- Politiques pour tasks
CREATE POLICY "Allow public access to tasks" ON tasks
  FOR ALL USING (true);

-- Politiques pour finances
CREATE POLICY "Allow public access to finances" ON finances
  FOR ALL USING (true);

-- Politiques pour employees
CREATE POLICY "Allow public access to employees" ON employees
  FOR ALL USING (true);

-- Politiques pour attendance
CREATE POLICY "Allow public access to attendance" ON attendance
  FOR ALL USING (true);

-- Politiques pour employee_payments
CREATE POLICY "Allow public access to employee_payments" ON employee_payments
  FOR ALL USING (true);

-- Politiques pour cheptel
CREATE POLICY "Allow public access to cheptel" ON cheptel
  FOR ALL USING (true);

-- Politiques pour elevage_production
CREATE POLICY "Allow public access to elevage_production" ON elevage_production
  FOR ALL USING (true);

-- Politiques pour elevage_health
CREATE POLICY "Allow public access to elevage_health" ON elevage_health
  FOR ALL USING (true);

-- Politiques pour messages
CREATE POLICY "Allow public access to messages" ON messages
  FOR ALL USING (true);

-- Message de confirmation
DO $$ 
BEGIN 
  RAISE NOTICE 'Politiques RLS créées avec succès pour toutes les tables'; 
END $$;