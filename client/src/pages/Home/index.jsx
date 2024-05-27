import { useEffect, useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetch(
      `${import.meta.env.VITE_SERVER_URL}/users/all?page=${
        pagination.page
      }&limit=${pagination.limit}`
    )
      .then((res) => res.json())
      .then((json) => {
        setUsers(json.data.users);
        setPagination((prevState) => ({
          ...prevState,
          total: json.data.total,
        }));
      })
      .catch((err) => {
        console.log(err);
        setUsers([]);
      });
  }, [pagination.limit, pagination.page]);

  return (
    <div className="home">
      <span className="header">User List ({pagination.total})</span>
      <table className="table">
        <thead className="thead">
          <tr>
            <th>id</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>gender</th>
            <th>phone</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {users.map(({ id, first_name, last_name, email, gender, phone }) => {
            return (
              <tr
                key={id}
                onClick={() => {
                  navigate(`/user/${id}`);
                }}
              >
                <td>{id}</td>
                <td>{first_name}</td>
                <td>{last_name}</td>
                <td>{email}</td>
                <td>{gender}</td>
                <td>{phone}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        {Array(pagination.total / pagination.limit)
          .fill(0)
          .map((element, i) => {
            return (
              <button
                key={i}
                className={i + 1 === pagination.page ? "button-active" : ""}
                onClick={() =>
                  setPagination((prevState) => ({ ...prevState, page: i + 1 }))
                }
              >
                {i + 1}
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Home;
