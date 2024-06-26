import styles from "./AdminPage.module.scss";
import {Wrench, Power, Trash} from "@phosphor-icons/react";
import ProductsMenu from "../../Common/ProductsMenu/ProductsMenu.jsx";
import {useCallback, useState, useMemo, useEffect, useContext} from "react";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import axios from "axios";
import {Bounce, toast} from "react-toastify";
import {AuthContext} from "../../../Context/AuthContext.jsx";
import React from "react";
import {Link} from "react-router-dom";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Button from '@mui/material/Button';
import {CategoriesManagement} from "../../Common/CategoriesManagement/CategoriesManagement.jsx";
import {OrdersManagement} from "../../Common/OrdersManagement/OrdersManagement.jsx";


const itemsPerPage = 9;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// QUANTITY COLOR
const getQuantityColor = (quantity) => {
    if (quantity >= 10) {
        return "green";
    } else if (quantity >= 5) {
        return "yellow";
    } else {
        return "red";
    }
};

const AdminPage = () => {

    const {
        handleExit
    } = useContext(AuthContext);

    const [isUpdating, setIsUpdating] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [shouldUpdate, setShouldUpdate] = useState(Date.now());
    const [productsData, setProductsData] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);


    const update = useCallback(() => {
        setShouldUpdate(Date.now())
    }, [])

    useEffect(() => {
        (async () => {
            try {
                const response = await axios.get("https://e-commerce-mock-server.onrender.com/products");
                setProductsData(response.data.map(product => ({
                    ...product,
                    stockStatus: product.quantity > 0 ? 'inStock' : 'outOfStock'
                })));
            } catch (error) {
                console.error('Axios error:', error);
            }
        })();
    }, [shouldUpdate]);

    const productsFiltered = useMemo(() => {
        return productsData?.filter((it) =>
            it.title?.toLowerCase().includes(searchTerm?.toLowerCase())
        );
    }, [productsData, searchTerm]);

    const handleDeleteData = useCallback(async (id, title) => {
        try {
            setIsUpdating(true);
            await axios.delete(`https://e-commerce-mock-server.onrender.com/products/${id}`);
            update();
            toast.success(`${title} ugurla silindi!`, {
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsUpdating(false);
        }
    }, [])

    const handleOpenMenu = useCallback((product) => {
        if (product.id) setSelectedItem(product); else setSelectedItem(null);
        setMenuOpen(true);
    }, [setMenuOpen])

    const handleInputChange = useCallback((event) => {
        setSearchTerm(event.target.value)
    }, [setSearchTerm]);

    const handleCleanInput = useCallback(() => {
        setSearchTerm("");
    }, [setSearchTerm]);

    // FUNCTIONS TO OPEN DIALOG (DELETE PRODUCT)

    const handleOpenDialog = useCallback((product) => {
        setProductToDelete(product);
        setDialogOpen(true);

    },[setProductToDelete,setDialogOpen])

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setProductToDelete(null);

    },[setDialogOpen,setProductToDelete])

    const handleConfirmDelete = useCallback(async () => {
        if (productToDelete) {
            await handleDeleteData(productToDelete.id, productToDelete.title);
            handleCloseDialog();
        }
    },[productToDelete,handleDeleteData,handleCloseDialog])


    // PAGINATION
    const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage,
        [currentPage]);
    const endIndex = useMemo(() => startIndex + itemsPerPage, [startIndex]);
    const handlePageChange = useCallback((event, page) => {
        setCurrentPage(page);
    }, [setCurrentPage]);

    const currentProducts = useMemo(() => {
        return productsFiltered?.slice(startIndex, endIndex);
    }, [productsFiltered, startIndex, endIndex]);


    useEffect(() => {
        if (productsFiltered && productsFiltered.length > 0 && endIndex > productsFiltered.length - 1) {
            setCurrentPage(Math.ceil(productsFiltered?.length / itemsPerPage));
        }
    }, [endIndex, productsFiltered, setCurrentPage, itemsPerPage]);


    return (
        <>
            <Dialog
                open={dialogOpen}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleCloseDialog}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle
                >
                    {"Məhsulun silinməsi"}
                </DialogTitle>
                <DialogContent
                >
                    <DialogContentText id="alert-dialog-slide-description">
                        {`"${productToDelete?.title}" silməy istədiyinizə əminsiniz?`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        className={styles.customNoButton}
                        onClick={handleCloseDialog}>Xeyr</Button>
                    <Button
                        className={styles.customYesButton}
                        onClick={handleConfirmDelete}>Bəli</Button>
                </DialogActions>
            </Dialog>
            <div className={styles.adminPageWrapper}>
                <ProductsMenu setMenuOpen={setMenuOpen}
                              menuOpen={menuOpen}
                              selectedItem={selectedItem}
                              setSelectedItem={setSelectedItem}
                              setIsUpdating={setIsUpdating}
                              isUpdating={isUpdating}
                              update={update}
                />
                <div className={styles.adminPageContent}>
                    <div className={styles.pageHeading}>
                        <h1>Product Categories</h1>
                        <div className={styles.exit} onClick={handleExit}>
                            <Power/>
                        </div>
                    </div>
                    <CategoriesManagement/>
                    <div className={`${styles.pageHeading} ${styles.ordersHeading}`}>
                        <h1>ORDERS</h1>
                    </div>
                    <OrdersManagement/>
                    <div className={styles.pageHeading}>
                        <h1>All products</h1>
                    </div>
                    <div className={styles.productManagement}>
                        <div className={styles.searchInput}>
                            <input type="text"
                                   placeholder="Enter product name"
                                   onChange={handleInputChange}
                                   value={searchTerm}
                            />
                        </div>
                        <div className={styles.buttons}>
                            <div className={`${styles.button} ${styles.addStaff}`} onClick={handleOpenMenu}>
                                Add Product
                            </div>
                            <div className={`${styles.button} ${styles.reset}`}
                                 onClick={handleCleanInput}>
                                Reset
                            </div>
                        </div>
                    </div>
                    <div className={styles.overFlow}>
                        <div className={styles.allProductsTable}>
                            <div className={styles.table}>
                                <div className={`${styles.tableRow} ${styles.tableHeading}`}>
                                    <div className={`${styles.id} ${styles.tableCell}`}>
                                        ID
                                    </div>
                                    <div className={`${styles.image} ${styles.tableCell}`}>
                                        Image
                                    </div>
                                    <div className={`${styles.name} ${styles.tableCell}`}>
                                        Product Name
                                    </div>
                                    <div className={`${styles.price} ${styles.tableCell}`}>
                                        Price
                                    </div>
                                    <div className={`${styles.quantity} ${styles.tableCell}`}>
                                        Quantity
                                    </div>
                                    <div className={`${styles.size} ${styles.tableCell}`}>
                                        Size
                                    </div>
                                    <div className={`${styles.rating} ${styles.tableCell}`}>
                                        Rating
                                    </div>
                                    <div className={`${styles.category} ${styles.tableCell}`}>
                                        Category
                                    </div>
                                    <div className={`${styles.actions} ${styles.tableCell}`}>
                                        Actions
                                    </div>
                                </div>
                                {currentProducts?.length !== 0 ?
                                    currentProducts?.map((product) => {
                                        return (
                                            <div key={product.id}
                                                 className={`${styles.tableRow} ${styles.productsTable}`}>
                                                <div className={`${styles.id} ${styles.tableCell}`}>
                                                    {product.id}
                                                </div>
                                                <div className={`${styles.image} ${styles.tableCell}`}>
                                                    <img src={product.frontImage} alt="Product"/>
                                                </div>
                                                <div className={`${styles.name} ${styles.tableCell}`}>
                                                    <Link to={`/details/${product.id}`}>
                                                        {product.title}
                                                    </Link>
                                                </div>
                                                <div className={`${styles.price} ${styles.tableCell}`}>
                                            <span>{product?.regularPrice ?
                                                <p>$ {product.regularPrice?.toFixed(2)}</p> : null}$ {product.salePrice?.toFixed(2)}</span>
                                                </div>
                                                <div className={`${styles.quantity} ${styles.tableCell}`}>
                                                    {<span style={{
                                                        color: getQuantityColor(product?.quantity)
                                                    }}>{product?.quantity > 0 ? product?.quantity : "Out of stock"}</span>}
                                                </div>
                                                <div className={`${styles.size} ${styles.tableCell}`}>
                                                    {product?.size?.join(",")}
                                                </div>
                                                <div className={`${styles.rating} ${styles.tableCell}`}>
                                                    {product?.rating}
                                                </div>
                                                <div className={`${styles.category} ${styles.tableCell}`}>
                                                    {product.category}
                                                </div>

                                                <div className={`${styles.actions} ${styles.tableCell}`}>
                                                    <div className={styles.action}>
                                                        <Wrench onClick={() => handleOpenMenu(product)}/>
                                                    </div>

                                                    <div className={styles.action}
                                                         style={{
                                                        opacity: isUpdating ? 0.5 : 1,
                                                        pointerEvents: isUpdating ? 'none' : 'all',
                                                    }}
                                                         onClick={() => handleOpenDialog(product)}
                                                    >
                                                        <Trash/>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                    :
                                    <div className={styles.noProducts}>
                                        No products found...
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className={styles.paginationWrapper}>
                        <Stack spacing={1}>
                            <Pagination
                                count={Math.ceil(productsFiltered?.length / itemsPerPage)}
                                variant="outlined"
                                shape="rounded"
                                size="large"
                                page={currentPage}
                                onChange={handlePageChange}
                            />
                        </Stack>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminPage;