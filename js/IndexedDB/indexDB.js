// ----------------------------------------------------------------
// Abrir IndexedDB
export async function crearIndexedDB() {
  let db;

  const request = indexedDB.open("dbBlog-Tech", 1);

  request.onupgradeneeded = (e) => {
    db = e.target.result;

    // ----------------------------------------------------------------
    // Tabla para los usuarios
    const userStore = db.createObjectStore("users", {
      keyPath: "id",
      autoIncrement: true,
    });

    userStore.createIndex("usuario", "usuario", { unique: true });
    userStore.createIndex("tipo", "tipo", { unique: false });
    userStore.createIndex("fotoPerfil", "fotoPerfil", { unique: false }); //Perfil usuario
    userStore.createIndex("email", "email", { unique: true });
    userStore.createIndex("password", "password", { unique: false });
    userStore.createIndex("banned", "banned", { unique: false });
    userStore.createIndex("nombre", "nombre", { unique: false });
    userStore.createIndex("ciudad", "ciudad", { unique: false });
    userStore.createIndex("telefono", "telefono", { unique: true });
    userStore.createIndex("edad", "edad", { unique: false });
    userStore.createIndex("descripcion", "descripcion", { unique: false });
    userStore.createIndex("comentarios", "comentarios", { multiEntry: true });
    // Un array con los id de los post [1, 3, 5] a los que dio like
    userStore.createIndex("likes", "likes", { multiEntry: true });

    // ----------------------------------------------------------------
    // Tabla para los posts
    const postStore = db.createObjectStore("posts", {
      keyPath: "id",
      autoIncrement: true,
    });
    postStore.createIndex("autor", "autor", { unique: false }); //Autor del post
    postStore.createIndex("fotoPerfilAutor", "fotoPerfilAutor", {
      unique: false,
    });
    postStore.createIndex("nombre", "nombre", { unique: true });
    postStore.createIndex("imagen", "imagen", { unique: false });
    postStore.createIndex("contenido", "contenido", { unique: false });
    postStore.createIndex("fechaDePublicacion", "fechaDePublicacion", {
      unique: false,
    });
    postStore.createIndex("categorias", "categorias", { multiEntry: true });
    postStore.createIndex("comentarios", "comentarios", { multiEntry: true });
    // Un array con los id de los usuarios [1, 3, 5] que dieron likes
    postStore.createIndex("likes", "likes", { multiEntry: true });
  };

  // Contraseña para el admin por defecto
  const hash = await hashPassword("password");

  // ----------------------------------------------------------------
  // Exito
  request.onsuccess = (e) => {
    db = e.target.result;

    // ----------------------------------------------------------------
    // Creamos el admin por defecto
    const admin = {
      usuario: "admin",
      tipo: "admin",
      email: "admin@gmail.com",
      password: hash,
      banned: false, // NO BANEADO
    };
    const admin2 = {
      usuario: "admin2",
      tipo: "admin",
      email: "admin2@gmail.com",
      password: hash,
      banned: true, // BANEADO
    };

    const admin3 = {
      usuario: "admin3",
      tipo: "admin",
      email: "admin3@gmail.com",
      password: hash,
      banned: false, // NO BANEADO
    };

    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(admin);
    add.onsuccess = () => {
      console.log("Se creo admin e IndexedDB con exito");
    };

    const transaccion2 = db.transaction("users", "readwrite");
    const objeto2 = transaccion2.objectStore("users");
    const add2 = objeto2.add(admin2);
    add2.onsuccess = () => {
      console.log("Se creo admin 2 e IndexedDB con exito");
    };

    const transaccion3 = db.transaction("users", "readwrite");
    const objeto3 = transaccion3.objectStore("users");
    const add3 = objeto3.add(admin3);
    add3.onsuccess = () => {
      console.log("Se creo admin 3 e IndexedDB con exito");
    };
  };

  // ----------------------------------------------------------------
  // Error
  request.onerror = (e) => {
    console.error("Error al crear IndexDB", e.target.result);
  };
}

// --------------------------------------------------------------
// Hash de contraseña para no guardarla en texto plano
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// ----------------------------------------------------------------
// Agregar usuario
export function addUser(usuario) {
  const request = indexedDB.open("dbBlog-Tech", 1);

  request.onsuccess = (e) => {
    const db = e.target.result;

    // Agregar usuario
    const transaccion = db.transaction("users", "readwrite");
    const objeto = transaccion.objectStore("users");
    const add = objeto.add(usuario);
    add.onsuccess = () => {
      console.log("Se agrego usuario con exito");
    };
  };
}

//Editar usuario
export function putUser(usuario) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readwrite");
      const objeto = transaccion.objectStore("users");
      const add = objeto.put(usuario);

      add.onsuccess = () => {
        console.log("Se actualizó el usuario con éxito");
        db.close();
        resolve();
      };

      add.onerror = () => {
        console.error("Error al actualizar el usuario");
        db.close();
        reject("Error al actualizar el usuario");
      };
    };

    request.onerror = () => {
      console.error("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}

// ----------------------------------------------------------------
// Bucar usuario por user: Devuelve el usuario si existe o null
export function buscarUser(user) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");

      const index = objeto.index("usuario");
      const getRequest = index.get(user);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el usuario");
        reject("Error al buscar el usuario");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}

export function deleteUser(idUser) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readwrite");
      const store = transaccion.objectStore("users");
      const deleteRequest = store.delete(idUser);

      deleteRequest.onsuccess = (e) =>{
        console.log("Usuario eliminar con éxito", idUser);
        resolve();
      }

      deleteRequest.onerror = (event) => {
        console.error("Error al eliminar el usuario: ", event.target.error);
        reject(event.target.error);
      };

      transaccion.onerror = (event) => {
        console.error(
          "Error en la transacción al eliminar el usuario",
          event.target.error
        );
        reject(event.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
  });
}
// Bucar usuario por email: Devuelve el usuario si existe o null
export function buscarEmail(email) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");

      const index = objeto.index("email");
      const getRequest = index.get(email);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el email");
        reject("Error al buscar el email");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}

// ----------------------------------------------------------------
// Bucar usuario por id: Devuelve el usuario si existe o null
export function buscarId(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");
      const getRequest = objeto.get(id);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el usuario");
        reject("Error al buscar el usuario");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}

// ----------------------------------------------------------------
// Obtener todos los usuarios
export function obtenerTodosLosUsers() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("users", "readonly");
      const objeto = transaccion.objectStore("users");
      const getAllRequest = objeto.getAll();

      getAllRequest.onsuccess = () => {
        const resultados = getAllRequest.result;
        db.close();
        resolve(resultados); // Esto será un array con todos los usuarios
      };

      getAllRequest.onerror = () => {
        db.close();
        console.log("Error al obtener todos los usuarios");
        reject("Error al obtener todos los usuarios");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}
/*ACÁ COMIENZA LA SECCIÓN PARA PODER HACER CRUD DE UN POST*/
// Función para agregar un post
// Función para agregar un post
export function addPost(post) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("posts", "readwrite");
      const store = transaccion.objectStore("posts");
      const addRequest = store.add(post);

      addRequest.onsuccess = () => {
        console.log("Post agregado con éxito");
        resolve();
      };

      addRequest.onerror = (e) => {
        console.error("Error al agregar el post:", e.target.error);
        reject(e.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
  });
}

// Función para cargar todos los posts
export function cargarPosts() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("posts", "readonly");
      const store = transaccion.objectStore("posts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };

      getAllRequest.onerror = (e) => {
        console.error("Error al cargar los posts:", e.target.error);
        reject(e.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
  });
}
export function deletePost(postID) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaccion = db.transaction("posts", "readwrite");
      const store = transaccion.objectStore("posts");
      const deleteRequest = store.delete(postID);

      deleteRequest.onsuccess = () => {
        console.log("Post eliminado con éxito:", postID);
        resolve();
      };

      deleteRequest.onerror = (event) => {
        console.error("Error al eliminar el post:", event.target.error);
        reject(event.target.error);
      };

      transaccion.onerror = (event) => {
        console.error(
          "Error en la transacción al eliminar el post:",
          event.target.error
        );
        reject(event.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
  });
}

// Función para editar/actualizar un post existente
export function editPost(post) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;
      // Asegúrate de que el objectStore exista y la transacción sea readwrite
      if (!db.objectStoreNames.contains("posts")) {
        console.error("El objectStore 'posts' no existe.");
        reject("El objectStore 'posts' no existe.");
        db.close();
        return;
      }
      const transaccion = db.transaction("posts", "readwrite");
      const store = transaccion.objectStore("posts");

      // El método put actualiza el objeto si existe, o lo crea si no.
      const updateRequest = store.put(post);

      updateRequest.onsuccess = () => {
        console.log("Post actualizado con éxito:", post.id);
        resolve();
      };

      updateRequest.onerror = (event) => {
        console.error("Error al actualizar el post:", event.target.error);
        reject(event.target.error);
      };

      transaccion.onerror = (event) => {
        console.error(
          "Error en la transacción al actualizar el post:",
          event.target.error
        );
        reject(event.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
  });
}
/*
export function obtenerInformacionPerfil(User){
    return new Promise((resolve, reject) =>{
      const request = indexedDB.open("dbBlog-Tech", 1);

      request.onsuccess = (e) =>{
        const db = e.target.result;

        if(!db.objectStoreNames.contains("users")){
          console.error("El objecStore no contiene a los usuarios");
          reject("El objeto de users no existe");
          db.close();
          return;
        }
        const transaccion = db.transaccion("users", "readwrite");
        const store = transaccion.objectStore("users");

        const updateRequest = store.put(User)

        updateRequest.onsuccess = () =>{
          console.log("usuario actualizado con éxito" , User.id);
          resolve();

        };
        updateRequest.onerror = (event) => {
        console.error("Error al actualizar el usuario:", event.target.error);
        reject(event.target.error);
      };

      transaccion.onerror = (event) => {
        console.error("Error en la transacción al actualizar el usuario:", event.target.error);
        reject(event.target.error);
      };
    };

    request.onerror = (e) => {
      console.error("Error al abrir la base de datos:", e.target.error);
      reject(e.target.error);
    };
      
    })
}*/

// Bucar usuario por id: Devuelve el usuario si existe o null
export function buscarPostPoId(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dbBlog-Tech", 1);

    request.onsuccess = (e) => {
      const db = e.target.result;

      const transaccion = db.transaction("posts", "readonly");
      const objeto = transaccion.objectStore("posts");
      const getRequest = objeto.get(id);

      getRequest.onsuccess = () => {
        const resultado = getRequest.result;
        if (resultado) {
          resolve(resultado);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        console.log("Error al buscar el usuario");
        reject("Error al buscar el usuario");
      };
    };

    request.onerror = () => {
      console.log("Error al abrir la base de datos");
      reject("Error al abrir la base de datos");
    };
  });
}
