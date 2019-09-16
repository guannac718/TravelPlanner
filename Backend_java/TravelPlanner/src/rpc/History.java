package rpc;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import db.DBConnection;
import db.DBConnectionFactory;
import entity.Place;

/**
 * Servlet implementation class History
 */
@WebServlet("/history")
public class History extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public History() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
			throws ServletException, IOException {
		// check token 

		String userId = request.getParameter("user_id");
		if(RpcHelper.checkToken(request, response) == null) {
			System.out.println("token expired for user: "+userId);
			return;
		}
	
		
		System.out.println("Get history routes of userId: "+userId);
		JSONArray array = new JSONArray();
		
		DBConnection connection = DBConnectionFactory.getConnection();
		try {
			List<List<Place>> routes = connection.getRoutes(userId);
			for (List<Place> ithDay : routes) {
				JSONArray ith = new JSONArray();
				for (Place place : ithDay) {
					JSONObject p = place.toJSONObject();
					ith.put(p);
				}
				array.put(ith);
			}
			
			RpcHelper.writeJsonArray(response, array);
			
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			connection.close();
		}
	}
}
