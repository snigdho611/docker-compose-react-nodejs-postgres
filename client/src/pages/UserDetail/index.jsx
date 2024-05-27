import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./index.css";

const UserDetail = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_SERVER_URL}/user/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setUser(json.data);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
      });
  }, [id]);

  return (
    <div className="detail">
      <Link to={"/home"}>Go Back</Link>
      <table className="usertable">
        <tbody>
          <tr>
            <td>ID</td>
            <td>{user?.id}</td>
          </tr>
          <tr>
            <td>First name</td>
            <td>{user?.first_name}</td>
          </tr>
          <tr>
            <td>Last name</td>
            <td>{user?.last_name}</td>
          </tr>
          <tr>
            <td>Gender</td>
            <td>{user?.gender}</td>
          </tr>
          <tr>
            <td>Phone</td>
            <td>{user?.phone}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserDetail;
