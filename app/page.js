"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Modal,
  Select,
  Stack,
  TextField,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemCategory, setItemCategory] = useState("");
  const [modalType, setModalType] = useState("new");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptItem, setPromptItem] = useState({
    name: "",
    category: "",
    quantity: 1,
  });

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];

    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item, quantityToRemove = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity <= quantityToRemove) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {
          category,
          quantity: quantity - quantityToRemove,
        });
      }
    }
    await updateInventory();
  };

  const addItem = async (item, category, quantity = 1) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: existingQuantity, category: existingCategory } =
        docSnap.data();
      await setDoc(docRef, {
        category: existingCategory,
        quantity: existingQuantity + quantity,
      });
    } else {
      await setDoc(docRef, { category, quantity });
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName("");
    setItemQuantity(1);
    setItemCategory("");
    setModalType("new"); // Reset modal type to default
  };

  const handlePromptClose = () => {
    setPromptOpen(false);
    setPromptItem({ name: "", category: "", quantity: 1 });
  };

  const handlePromptConfirm = async () => {
    await addItem(promptItem.name, promptItem.category, promptItem.quantity);
    handlePromptClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted. Action:", modalType);

    if (modalType === "new") {
      await addItem(itemName, itemCategory, itemQuantity);
    } else if (modalType === "update") {
      const docRef = doc(collection(firestore, "inventory"), itemName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity: existingQuantity, category: existingCategory } = docSnap.data();
        await setDoc(docRef, {
          category: existingCategory,
          quantity: existingQuantity + itemQuantity,
        });
        await updateInventory();
      } else {
        setPromptItem({
          name: itemName,
          category: itemCategory,
          quantity: itemQuantity,
        });
        setPromptOpen(true);
      }
    } else if (modalType === "delete") {
      await removeItem(itemName, itemQuantity);
    }
    handleClose();
  };

  return (
    // ! Inventory Box
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/*  Manage Inventory Dialog Box  */}
      <Modal open={open} onClose={handleClose}>
        <Box
          component="form"
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
          onSubmit={handleSubmit}
        >
          <Typography variant="h6">Manage Entries</Typography>
          <FormControl fullWidth>
            <InputLabel id="action-label">Action</InputLabel>
            <Select
              value={modalType}
              onChange={(e) => setModalType(e.target.value)}
              label="Action"
              labelId="action-label"
            >
              <MenuItem value="" disabled>
                Select an action
              </MenuItem>
              <MenuItem value="new">New Item</MenuItem>
              <MenuItem value="update">Update Existing Item</MenuItem>
              <MenuItem value="delete">Remove Item</MenuItem>
            </Select>
          </FormControl>

          {modalType === "new" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
              <TextField
                label="Category"
                variant="outlined"
                fullWidth
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
              />
            </>
          )}

          {modalType === "update" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity to Add"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
            </>
          )}

          {modalType === "delete" && (
            <>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                label="Quantity to Remove"
                variant="outlined"
                fullWidth
                type="number"
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Number(e.target.value))}
              />
            </>
          )}
          <Button variant="outlined" type="submit">
            {modalType === "new"
              ? "ADD"
              : modalType === "update"
              ? "UPDATE"
              : "DELETE"}
          </Button>
        </Box>
      </Modal>
      <Button variant="contained" onClick={handleOpen}>
        Manage Inventory
      </Button>
      {/* Inventory List: Items are displayed */}
      <Box border="1px solid #333" borderRadius="15px">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="15px"
        >
          <Typography variant="h2" color="#333">
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({ name, quantity, category }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f0f0f0"
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {category}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  Remove
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(name, category);
                  }}
                >
                  Add
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
      <Dialog 
      open={promptOpen}
      onClose={handlePromptClose}
      >
        <DialogTitle>Item Not Found</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The item "{promptItem.name}" was not found in the inventory. Would you like to add it?
            </DialogContentText>
            <TextField
              label="Category"
              variant="outlined"
              fullWidth
              value={promptItem.category}
              onChange = {(e) => setPromptItem({...promptItem, category: e.target.value})}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick= {handlePromptClose} color="primary">Cancel</Button>
            <Button onClick= {handlePromptClose} color="primary">Add Item</Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
}
