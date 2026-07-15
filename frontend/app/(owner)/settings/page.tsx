"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import PageHeader from "@/components/PageHeader";

const RESTAURANT_FIELDS: { name: string; label: string; type?: string; placeholder?: string }[] = [
  { name: "restaurant_name", label: "Restaurant name", placeholder: "The Copper Ladle" },
  { name: "brand_name", label: "Brand name", placeholder: "Copper Ladle Hospitality" },
  { name: "category", label: "Category", placeholder: "Restaurant" },
  { name: "phone", label: "Phone", placeholder: "+91 98765 43210" },
  { name: "email", label: "Email", type: "email", placeholder: "hello@copperladle.com" },
  { name: "address", label: "Address", placeholder: "12 MG Road" },
  { name: "city", label: "City", placeholder: "Nagpur" },
  { name: "state", label: "State", placeholder: "Maharashtra" },
  { name: "country", label: "Country", placeholder: "India" },
  { name: "google_review_link", label: "Google review link", placeholder: "https://g.page/r/xxxx/review" },
];

const THEME_PALETTES = [
  { name: "Warm Ticket", colors: ["#C1481D", "#FBF3E7", "#241A14"] },
  { name: "Modern Green", colors: ["#5F7A52", "#F4F8EF", "#1F2A1C"] },
  { name: "Premium Dark", colors: ["#241A14", "#FFFFFF", "#D99A32"] },
  { name: "Soft Plum", colors: ["#8B3A56", "#FFF6F8", "#2B1820"] },
];

type RestaurantCard = {
  id: string;
  restaurant_name: string;
  brand_name?: string;
  cuisine?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  google_review_url?: string;
  short_code?: string;
};

function settingKey(restaurantId: string, key: string) {
  return `gr_restaurant_${restaurantId}_${key}`;
}

export default function SettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [restaurants, setRestaurants] = useState<RestaurantCard[]>([]);
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);
  const [threshold, setThreshold] = useState(4.0);
  const [activePalette, setActivePalette] = useState(THEME_PALETTES[0].name);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [ownerId, setOwnerId] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const securityScore = useMemo(() => {
    let score = 40;
    if (ownerEmail) score += 20;
    if (ownerPhone) score += 15;
    if (restaurants.length > 0) score += 15;
    if (activePalette) score += 10;
    return Math.min(score, 100);
  }, [activePalette, ownerEmail, ownerPhone, restaurants.length]);

  useEffect(() => {
    const id = localStorage.getItem("gr_owner_id") || "";
    const currentRestaurantId = localStorage.getItem("gr_restaurant_id");
    const localRestaurantName = localStorage.getItem("gr_restaurant_name") || "Current restaurant";
    const localShortCode = localStorage.getItem("gr_restaurant_short_code") || "";

    setOwnerId(id);
    setOwnerName(localStorage.getItem("gr_owner_name") || "");
    setOwnerEmail(localStorage.getItem("gr_owner_email") || "");
    setOwnerPhone(localStorage.getItem("gr_owner_phone") || "");

    if (id) {
      api.listRestaurants(id)
        .then((res) => {
          const list = (res.restaurants || []) as RestaurantCard[];
          setRestaurants(list);
          if (list.length > 0) selectRestaurant(list[0]);
        })
        .catch(() => {
          if (currentRestaurantId) {
            const fallback = {
              id: currentRestaurantId,
              restaurant_name: localRestaurantName,
              short_code: localShortCode,
            };
            setRestaurants([fallback]);
            selectRestaurant(fallback);
          }
        });
    } else if (currentRestaurantId) {
      const fallback = {
        id: currentRestaurantId,
        restaurant_name: localRestaurantName,
        short_code: localShortCode,
      };
      setRestaurants([fallback]);
      selectRestaurant(fallback);
    }
  }, []);

  function selectRestaurant(restaurant: RestaurantCard) {
    setActiveRestaurantId(restaurant.id);
    setForm({
      restaurant_name: restaurant.restaurant_name || "",
      brand_name: restaurant.brand_name || restaurant.restaurant_name || "",
      category: restaurant.cuisine || "Restaurant",
      phone: restaurant.phone || "",
      email: restaurant.email || "",
      address: restaurant.address || "",
      city: restaurant.city || "",
      state: restaurant.state || "",
      country: restaurant.country || "India",
      google_review_link: restaurant.google_review_url || "",
    });

    const savedThreshold = localStorage.getItem(settingKey(restaurant.id, "threshold"));
    const savedTheme = localStorage.getItem(settingKey(restaurant.id, "theme"));
    setThreshold(savedThreshold ? Number(savedThreshold) : 4.0);
    setActivePalette(savedTheme || THEME_PALETTES[0].name);
  }

  function update(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function persistLocalRestaurantSettings(restaurantId: string) {
    localStorage.setItem(settingKey(restaurantId, "threshold"), String(threshold));
    localStorage.setItem(settingKey(restaurantId, "theme"), activePalette);
    localStorage.setItem("gr_active_theme", activePalette);
    localStorage.setItem("gr_active_threshold", String(threshold));
  }

  async function handleRestaurantSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const body = { rating_threshold: threshold, ...form };
      let id = activeRestaurantId;
      if (id) {
        await api.updateRestaurant(id, body);
        setMessage("Restaurant details updated.");
      } else {
        const res = (await api.createRestaurant({ owner_id: ownerId || "owner-placeholder", ...body })) as {
          id?: string;
          restaurant_id?: string;
          data?: { id?: string }[];
        };
        id = res.id || res.restaurant_id || res.data?.[0]?.id || null;
        setMessage("Restaurant created.");
      }

      if (id) {
        persistLocalRestaurantSettings(id);
        localStorage.setItem("gr_restaurant_id", id);
        localStorage.setItem("gr_restaurant_name", form.restaurant_name || "");
        setActiveRestaurantId(id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleProfileSave() {
    if (!ownerId) return setError("Please log in again before updating profile.");
    setError(null);
    const res = await api.updateProfile({ user_id: ownerId, full_name: ownerName, phone: ownerPhone });
    localStorage.setItem("gr_owner_name", ownerName);
    localStorage.setItem("gr_owner_phone", ownerPhone);
    setMessage((res as any).message || "Profile updated.");
  }

  async function handleEmailChange() {
    if (!ownerId) return setError("Please log in again before changing email.");
    setError(null);
    const res = await api.changeEmail({ user_id: ownerId, new_email: newEmail, current_password: profilePassword });
    localStorage.setItem("gr_owner_email", newEmail);
    setOwnerEmail(newEmail);
    setNewEmail("");
    setProfilePassword("");
    setMessage((res as any).message || "Email updated.");
  }

  async function handlePasswordChange() {
    if (!ownerId) return setError("Please log in again before changing password.");
    setError(null);
    const res = await api.changePassword({ user_id: ownerId, current_password: currentPassword, new_password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setMessage((res as any).message || "Password updated.");
  }

  async function handleForgotPassword() {
    const email = newEmail || ownerEmail;
    if (!email) return setError("Enter your account email first.");
    setError(null);
    const res = await api.forgotPassword({ email });
    setMessage((res as any).message || "Reset request sent.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="Owner setup"
        title="Settings"
        description="Edit restaurants, rating rules, themes, and account security from one place."
      />

      <div className="grid gap-8 px-8 py-8 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-8">
          <section className="border border-line bg-paper p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Restaurants</p>
                <p className="mt-1 text-sm text-ink-soft">Select a restaurant, edit details, threshold, and theme.</p>
              </div>
              <button
                onClick={() => {
                  setActiveRestaurantId(null);
                  setForm({});
                  setThreshold(4.0);
                  setActivePalette(THEME_PALETTES[0].name);
                }}
                className="border border-ink px-4 py-2 text-sm text-ink hover:bg-ink hover:text-paper"
              >
                Add restaurant
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {restaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`border p-4 ${activeRestaurantId === restaurant.id ? "border-paprika bg-paprika/5" : "border-line bg-paper-dim"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-ink">{restaurant.restaurant_name}</p>
                      <p className="mt-1 text-sm text-ink-soft">{restaurant.city || "No city added"}</p>
                      <p className="mt-2 font-mono text-xs text-paprika">{restaurant.short_code || "No QR yet"}</p>
                    </div>
                    <button
                      onClick={() => selectRestaurant(restaurant)}
                      className="border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-paprika hover:text-paprika"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
              {restaurants.length === 0 && (
                <p className="text-sm text-ink-faint">No restaurants yet. Add your first restaurant below.</p>
              )}
            </div>
          </section>

          <form onSubmit={handleRestaurantSubmit}>
            <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              Restaurant details
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              {RESTAURANT_FIELDS.map((field) => (
                <label key={field.name} className="block text-sm">
                  <span className="mb-1.5 block font-medium text-ink-soft">{field.label}</span>
                  <input
                    required
                    type={field.type || "text"}
                    placeholder={field.placeholder}
                    value={form[field.name] || ""}
                    onChange={(e) => update(field.name, e.target.value)}
                    className="w-full border border-line bg-paper px-3.5 py-2.5 text-ink outline-none focus:border-paprika"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="border border-line bg-paper p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-ink-soft">Rating threshold</span>
                  <span className="font-mono text-lg tabular text-paprika">{threshold.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={4.5}
                  step={0.5}
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="mt-3 w-full accent-paprika"
                />
                <p className="mt-2 text-xs text-ink-faint">
                  Lower ratings always trigger private feedback and email alert.
                </p>
              </div>

              <div className="border border-line bg-paper p-5">
                <p className="text-sm font-medium text-ink-soft">Theme palette</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {THEME_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      type="button"
                      onClick={() => {
                        setActivePalette(palette.name);
                        localStorage.setItem("gr_active_theme", palette.name);
                      }}
                      className={`border p-3 text-left text-xs ${activePalette === palette.name ? "border-paprika bg-paprika/5" : "border-line bg-paper-dim"}`}
                    >
                      {palette.name}
                      <span className="mt-2 flex gap-1.5">
                        {palette.colors.map((color) => (
                          <span key={color} className="h-4 w-4 border border-line" style={{ backgroundColor: color }} />
                        ))}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-6 bg-paprika px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paprika-dark disabled:opacity-60"
            >
              {saving ? "Saving..." : activeRestaurantId ? "Save restaurant changes" : "Create restaurant"}
            </button>
          </form>

          {message && <p className="text-sm text-sage-dark">{message}</p>}
          {error && <p className="text-sm text-plum-dark">{error}</p>}
        </div>

        <aside className="space-y-6">
          <section className="border border-line bg-paper p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Profile</p>
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block text-ink-soft">Owner name</span>
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1.5 block text-ink-soft">Phone</span>
              <input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <button onClick={handleProfileSave} className="mt-4 w-full bg-ink px-4 py-2.5 text-sm text-paper hover:bg-ink-soft">
              Save profile
            </button>
          </section>

          <section className="border border-line bg-paper p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Account security</p>
            <div className="mt-4 border border-line bg-paper-dim p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-soft">Security score</span>
                <span className="font-mono text-xl text-paprika">{securityScore}%</span>
              </div>
              <div className="mt-3 h-2 bg-paper">
                <div className="h-full bg-paprika" style={{ width: `${securityScore}%` }} />
              </div>
            </div>

            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block text-ink-soft">New email</span>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={ownerEmail || "owner@example.com"} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1.5 block text-ink-soft">Current password</span>
              <input type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <button onClick={handleEmailChange} className="mt-4 w-full border border-ink px-4 py-2.5 text-sm text-ink hover:bg-ink hover:text-paper">
              Change email
            </button>

            <label className="mt-5 block text-sm">
              <span className="mb-1.5 block text-ink-soft">Old password</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1.5 block text-ink-soft">New password</span>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full border border-line bg-paper-dim px-3 py-2 outline-none focus:border-paprika" />
            </label>
            <button onClick={handlePasswordChange} className="mt-4 w-full bg-paprika px-4 py-2.5 text-sm text-paper hover:bg-paprika-dark">
              Change password
            </button>
            <button onClick={handleForgotPassword} className="mt-3 w-full text-sm text-ink-faint underline underline-offset-2 hover:text-ink">
              Forgot password?
            </button>
          </section>

          <section className="border border-line bg-paper p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Low rating alerts</p>
            <p className="mt-2 text-sm text-ink-soft">
              Strict rule: ratings below the threshold save private feedback and trigger an owner email alert when Resend is configured.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
