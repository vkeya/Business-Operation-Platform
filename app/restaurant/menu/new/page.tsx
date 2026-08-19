import MenuForm from "./MenuForm";

export default function NewRestaurantMenuPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Restaurant / Menu
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create menu
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Create a menu for the products and dishes your restaurant offers.
        </p>
      </div>

      <MenuForm />
    </div>
  );
}