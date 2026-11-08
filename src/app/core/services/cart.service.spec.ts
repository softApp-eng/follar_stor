import { TestBed } from '@angular/core/testing';
import { PRODUCTS, priceFor } from '../data/products';
import { CartService } from './cart.service';

describe('CartService', () => {
  const coat = PRODUCTS[0];
  const tee = PRODUCTS.find((product) => product.slug === 'tee-coton-lourd')!;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('adds a product and computes the totals', () => {
    const cart = TestBed.inject(CartService);
    cart.add(coat, 'M', 2);

    expect(cart.count()).toBe(2);
    expect(cart.subtotal()).toBe(coat.price * 2);
    expect(cart.shipping()).toBe(0);
    expect(cart.total()).toBe(coat.price * 2);
  });

  it('merges lines with the same size and caps quantities at 9', () => {
    const cart = TestBed.inject(CartService);
    cart.add(coat, 'M', 1);
    cart.add(coat, 'M', 9);

    expect(cart.lines().length).toBe(1);
    expect(cart.count()).toBe(9);
  });

  it('keeps separate lines per size', () => {
    const cart = TestBed.inject(CartService);
    cart.add(coat, 'S', 1);
    cart.add(coat, 'L', 1);

    expect(cart.lines().length).toBe(2);
    expect(cart.count()).toBe(2);
  });

  it('uses the unit price and charges shipping below the threshold', () => {
    const cart = TestBed.inject(CartService);
    cart.add(tee, 'M', 1);

    expect(cart.items()[0].unitPrice).toBe(priceFor(tee));
    expect(cart.shipping()).toBe(6);
  });

  it('removes a line when its quantity reaches zero', () => {
    const cart = TestBed.inject(CartService);
    cart.add(coat, 'M', 1);
    cart.setQty(cart.lines()[0], 0);

    expect(cart.count()).toBe(0);
    expect(cart.items()).toEqual([]);
  });
});
