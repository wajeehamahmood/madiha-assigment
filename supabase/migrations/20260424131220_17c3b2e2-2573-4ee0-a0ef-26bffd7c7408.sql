CREATE TABLE public.flowers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 120),
  category TEXT NOT NULL CHECK (char_length(category) <= 80),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  description TEXT NOT NULL CHECK (char_length(description) <= 800),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.shop_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) <= 120),
  email TEXT NOT NULL CHECK (char_length(email) <= 255),
  flower_id UUID REFERENCES public.flowers(id) ON DELETE SET NULL,
  flower_name TEXT NOT NULL CHECK (char_length(flower_name) <= 120),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 100),
  message TEXT CHECK (char_length(message) <= 500),
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Preparing', 'Delivered')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flowers"
ON public.flowers
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create flowers"
ON public.flowers
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can edit flowers"
ON public.flowers
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Anyone can remove flowers"
ON public.flowers
FOR DELETE
USING (true);

CREATE POLICY "Anyone can view orders"
ON public.shop_orders
FOR SELECT
USING (true);

CREATE POLICY "Anyone can create orders"
ON public.shop_orders
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can edit orders"
ON public.shop_orders
FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_flowers_updated_at
BEFORE UPDATE ON public.flowers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at
BEFORE UPDATE ON public.shop_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_flowers_category ON public.flowers(category);
CREATE INDEX idx_flowers_featured ON public.flowers(featured);
CREATE INDEX idx_shop_orders_created_at ON public.shop_orders(created_at DESC);