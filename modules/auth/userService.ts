export async function getUsers(search = "") {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    const query = params.toString();
    const res = await fetch(`/api/users${query ? `?${query}` : ""}`);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch users");
    }
    return await res.json();
}

export async function addUser(data: any) {
    const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.error || "Failed to add user");
    }
    return json;
}

export async function updateUser(id: string, data: any) {
    const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data })
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.error || "Failed to update user");
    }
    return json;
}

export async function deleteUser(id: string) {
    const res = await fetch(`/api/users?id=${id}`, {
        method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) {
        throw new Error(json.error || "Failed to delete user");
    }
    return json;
}
