DROP POLICY IF EXISTS "Anyone can create flowers" ON public.flowers;
DROP POLICY IF EXISTS "Anyone can edit flowers" ON public.flowers;
DROP POLICY IF EXISTS "Anyone can remove flowers" ON public.flowers;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.shop_orders;
DROP POLICY IF EXISTS "Anyone can edit orders" ON public.shop_orders;

CREATE POLICY "Anyone can create valid flowers"
ON public.flowers
FOR INSERT
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 120
  AND char_length(trim(category)) BETWEEN 1 AND 80
  AND price >= 0
  AND stock >= 0
  AND char_length(trim(description)) BETWEEN 1 AND 800
);

CREATE POLICY "Anyone can edit valid flowers"
ON public.flowers
FOR UPDATE
USING (id IS NOT NULL)
WITH CHECK (
  char_length(trim(name)) BETWEEN 1 AND 120
  AND char_length(trim(category)) BETWEEN 1 AND 80
  AND price >= 0
  AND stock >= 0
  AND char_length(trim(description)) BETWEEN 1 AND 800
);

CREATE POLICY "Anyone can remove existing flowers"
ON public.flowers
FOR DELETE
USING (id IS NOT NULL);

CREATE POLICY "Anyone can create valid orders"
ON public.shop_orders
FOR INSERT
WITH CHECK (
  char_length(trim(customer_name)) BETWEEN 1 AND 120
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND char_length(trim(flower_name)) BETWEEN 1 AND 120
  AND quantity BETWEEN 1 AND 100
  AND status IN ('New', 'Preparing', 'Delivered')
);

CREATE POLICY "Anyone can edit valid orders"
ON public.shop_orders
FOR UPDATE
USING (id IS NOT NULL)
WITH CHECK (
  char_length(trim(customer_name)) BETWEEN 1 AND 120
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND char_length(trim(flower_name)) BETWEEN 1 AND 120
  AND quantity BETWEEN 1 AND 100
  AND status IN ('New', 'Preparing', 'Delivered')
);