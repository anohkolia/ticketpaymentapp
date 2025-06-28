# Instructions pour appliquer la migration Supabase

## Problème
L'erreur "Could not find the 'created_by' column of 'events' in the schema cache" indique que la migration n'a pas été appliquée à votre base de données.

## Solutions possibles

### Option 1: Via l'interface Supabase (Recommandée)

1. **Connectez-vous à votre tableau de bord Supabase**
   - Allez sur https://supabase.com/dashboard
   - Sélectionnez votre projet

2. **Accédez à l'éditeur SQL**
   - Dans le menu de gauche, cliquez sur "SQL Editor"
   - Ou allez dans "Database" > "SQL Editor"

3. **Exécutez la migration manuellement**
   - Copiez le contenu du fichier `supabase/migrations/20250628153606_restless_sun.sql`
   - Collez-le dans l'éditeur SQL
   - Cliquez sur "Run" pour exécuter

### Option 2: Via le CLI Supabase

Si vous avez le CLI Supabase installé :

```bash
# Installer le CLI (si pas déjà fait)
npm install -g supabase

# Se connecter à Supabase
supabase login

# Lier votre projet local au projet Supabase
supabase link --project-ref YOUR_PROJECT_REF

# Appliquer les migrations
supabase db push
```

### Option 3: Exécution manuelle du SQL

Si les options précédentes ne fonctionnent pas, vous pouvez exécuter manuellement ce SQL dans l'interface Supabase :

```sql
-- Add created_by column to events table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE events ADD COLUMN created_by uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update RLS policies for events table
DROP POLICY IF EXISTS "Users can read all events" ON events;
DROP POLICY IF EXISTS "Users can create events" ON events;
DROP POLICY IF EXISTS "Users can update own events" ON events;
DROP POLICY IF EXISTS "Users can delete own events" ON events;

-- Create new RLS policies
CREATE POLICY "Anyone can read events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete own events"
  ON events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);
```

## Vérification

Après avoir appliqué la migration, vous pouvez vérifier que tout fonctionne :

1. **Vérifiez la structure de la table**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'events';
   ```

2. **Vérifiez les politiques RLS**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'events';
   ```

## Note importante

Les fichiers de migration dans `supabase/migrations/` ne sont pas automatiquement appliqués. Ils doivent être exécutés manuellement via l'une des méthodes ci-dessus.