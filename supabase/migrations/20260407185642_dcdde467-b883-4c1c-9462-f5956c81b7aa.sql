
-- RLS: Riders can view their assigned orders
CREATE POLICY "Riders can view assigned orders"
ON public.orders FOR SELECT TO authenticated
USING (
  rider_id = auth.uid() AND public.has_role(auth.uid(), 'rider'::app_role)
);

-- RLS: Riders can update status of assigned orders
CREATE POLICY "Riders can update assigned orders"
ON public.orders FOR UPDATE TO authenticated
USING (
  rider_id = auth.uid() AND public.has_role(auth.uid(), 'rider'::app_role)
);

-- RLS: Riders can view order items of assigned orders
CREATE POLICY "Riders can view assigned order items"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.rider_id = auth.uid()
    AND public.has_role(auth.uid(), 'rider'::app_role)
  )
);
