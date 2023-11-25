(async () => {
    while(!window & !window.firebase & !window.firebase.isReady()) {
        //wait firebase to load     
    }
    console.log("Firebase is ready!");

    const {
        collection,
        query,
        where,
        getDocs,
        addDoc,
        deleteDoc,
        doc,
        setDoc
    } = window.firestore;

    const {
    db,
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserSessionPersistence
    } = window.firebase;

    const elements={registerEmail: document.querySelector("#register-email"),
    registerPassword: document.querySelector("#register-password"),
    registerButton: document.querySelector("#register-button"),
    loginEmail: document.querySelector("#login-email"),
    loginPassword: document.querySelector("#login-password"),
    loginButton: document.querySelector("#login-button"),
    gotoRegister: document.querySelector("#go-to-register"),
    gotoLogin: document.querySelector("#go-to-login"),
    addButton: document.querySelector("#add-button"),
    signOutButton: document.querySelector('#sign-out-button')};

    const applicationSections =["loading","login","register","todos"];
    const orginalDisplayOptions = new Map();

    function showRelevantHTML(id="loading"){
        for(const section of applicationSections){
            const element = document.querySelector(`#${section}`);
            if (!orginalDisplayOptions.has(section)){
                orginalDisplayOptions.set(section,"block");
            }
            if(section==id){
                element.style.display = orginalDisplayOptions.get(section)
            }else{
                element.style.display = "none";
            }
        }
    }

    async function loadTodoItems() {
        const todoList = document.querySelector("#todo-items-list");
        const userId = auth.currentUser.uid
        const todoResult = await getDocs(collection(db, userId));

        todoList.innerHTML = "";

        todoResult.forEach(todoItem => {

            const date = new Date(todoItem.data().creationTimestamp);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(date.getUTCDate()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;
            
            todoList.innerHTML += `      <li class="todo-item">
            <div class="left">${todoItem.data().description}</div>
            
            <div class="right"><div>${formattedDate}</div> <button class="delete-button">Done</button></div>
        </li>`;
    });
    const deleteButtons= document.querySelectorAll(".delete-button");
    deleteButtons.forEach(b=>{b.addEventListener("click",()=>{deleteToDoItem(b)})});  

}
    
    async function addToDoItems(){
        try{
        const todoInput = document.querySelector("#todo-input");
        const userId = auth.currentUser.uid;
        const newTodoItemId = crypto.randomUUID();

        const newData = {
            creationTimestamp: new Date().getTime(),
            description: todoInput.value
          };

            await setDoc(doc(db,userId,newTodoItemId),newData);
            console.log("Document added with ID: ", newTodoItemId);
            loadTodoItems();
            todoInput.value = "";
          }
          catch(error){
            console.error("Error adding document: ", error);
          };
         
    }

    async function deleteToDoItem(b){
        const descriptionElement = b.closest('.todo-item').querySelector('.left').textContent;
        const userId = auth.currentUser.uid;
        const todoResult = await getDocs(query(collection(db, userId),where("description", "==",descriptionElement)));

        todoResult.forEach(async(todoItem)=>{
            //console.log(todoItem.id)
           await deleteDoc(doc(collection(db, userId),todoItem.id)) .then(() => {
            console.log("Document successfully deleted:", todoItem.id);
            const listItem = b.closest(".todo-item")
            listItem.remove()
          })
          .catch((error) => {
            console.error("Error deleting document:", todoItem.id, error);
          });
        })
        //console.log(todoResult)
    }

    async function registerUser(){
        const email = elements.registerEmail.value;
        const password = elements.registerPassword.value;
        console.log(email);
        try{
            await createUserWithEmailAndPassword(auth,email,password);
            todoApp();
        }catch(error){
            alert(error.message);

        }

    }

    async function loginUser(){
        const email = elements.loginEmail.value;
        const password = elements.loginPassword.value;
        try {
            await signInWithEmailAndPassword(auth,email,password);
            todoApp();
        } catch (error) {
            alert(error.message)
        }
    }

    async function signOutUser(){
        const todoList = document.querySelector("#todo-items-list");
        todoList.innerHTML = "";

        auth.signOut()

    }


    async function todoApp(){
        elements.gotoRegister.addEventListener("click",()=>{showRelevantHTML("register")});
        elements.gotoLogin.addEventListener("click",()=>{showRelevantHTML("login")});

        elements.registerButton.addEventListener("click",registerUser);
        elements.loginButton.addEventListener("click",loginUser);
        elements.addButton.addEventListener("click", addToDoItems);
        elements.signOutButton.addEventListener("click",signOutUser)
        auth.onAuthStateChanged(async function(user){
            if(user){
                showRelevantHTML("todos");
                await loadTodoItems();
            }
            else{
                showRelevantHTML("login");

            }
        })

        // if (auth.currentUser){
        //     showRelevantHTML("todos");
        //     await loadTodoItems();
        // }else{
        //     showRelevantHTML("login");
        // }
    }

    todoApp();
   
})();